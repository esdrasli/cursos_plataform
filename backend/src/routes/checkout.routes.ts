import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { Course } from '../entities/Course.js';
import { Sale } from '../entities/Sale.js';
import { Enrollment } from '../entities/Enrollment.js';
import { Affiliate } from '../entities/Affiliate.js';
import { AffiliateSale } from '../entities/AffiliateSale.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';
import { paymentService } from '../services/payment.service.js';
import Stripe from 'stripe';

const router = express.Router();

interface ProcessPaymentBody {
  courseId: string;
  paymentMethod: 'credit' | 'pix' | 'boleto';
  paymentData?: {
    number?: string;
    expiry?: string;
    cvv?: string;
    name?: string;
    installments?: number;
    document?: string;
  };
  affiliateCode?: string; // Código do afiliado
}

// Processar pagamento
router.post('/process', authenticate, async (req: AuthRequest<never, never, ProcessPaymentBody>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { courseId, paymentMethod, affiliateCode } = req.body;
    
    if (!courseId || !paymentMethod) {
      res.status(400).json({ message: 'courseId e paymentMethod são obrigatórios' });
      return;
    }
    
    const courseRepository = AppDataSource.getRepository(Course);
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const saleRepository = AppDataSource.getRepository(Sale);
    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const affiliateSaleRepository = AppDataSource.getRepository(AffiliateSale);
    
    // Buscar curso
    const course = await courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ message: 'Curso não encontrado' });
      return;
    }
    
    // Verificar se o usuário já está matriculado
    const existingEnrollment = await enrollmentRepository.findOne({
      where: {
        userId: req.user.id,
        courseId: course.id
      }
    });
    
    if (existingEnrollment) {
      res.status(400).json({ message: 'Você já está matriculado neste curso' });
      return;
    }
    
    // Verificar se há código de afiliado válido
    let affiliate: Affiliate | null = null;
    if (affiliateCode) {
      affiliate = await affiliateRepository.findOne({ 
        where: { 
          affiliateCode,
          status: 'active'
        } 
      });
    }

    // Processar pagamento com gateway
    const paymentResult = await paymentService.processPayment({
      amount: Number(course.price),
      description: `Compra do curso: ${course.title}`,
      paymentMethod,
      cardData: paymentMethod === 'credit' ? {
        number: req.body.paymentData?.number || '',
        expiry: req.body.paymentData?.expiry || '',
        cvv: req.body.paymentData?.cvv || '',
        name: req.body.paymentData?.name || '',
        installments: req.body.paymentData?.installments || 1,
      } : undefined,
      customer: {
        name: req.user.name,
        email: req.user.email,
        document: req.body.paymentData?.document,
      },
      metadata: {
        courseId: course.id,
        userId: req.user.id,
        affiliateCode: affiliate?.affiliateCode,
      },
    });

    if (!paymentResult.success) {
      res.status(400).json({ 
        message: paymentResult.error || 'Erro ao processar pagamento',
        paymentResult 
      });
      return;
    }

    // Criar registro de venda
    const sale = saleRepository.create({
      courseId: course.id,
      courseTitle: course.title,
      studentId: req.user.id,
      studentName: req.user.name,
      instructorId: course.instructorId,
      amount: Number(course.price),
      paymentMethod,
      status: paymentResult.status === 'approved' ? 'completed' : 
              paymentResult.status === 'pending' ? 'pending' : 'failed',
      transactionId: paymentResult.transactionId,
      affiliateCode: affiliate ? affiliate.affiliateCode : undefined,
    });
    
    await saleRepository.save(sale);

    // Processar comissão do afiliado se houver
    if (affiliate && sale.status === 'completed') {
      const commissionRate = parseFloat(affiliate.commissionRate.toString()) / 100;
      const commissionAmount = Number(course.price) * commissionRate;

      // Criar registro de venda do afiliado
      const affiliateSale = affiliateSaleRepository.create({
        affiliateId: affiliate.id,
        saleId: sale.id,
        courseId: course.id,
        studentId: req.user.id,
        saleAmount: Number(course.price),
        commissionRate: affiliate.commissionRate,
        commissionAmount,
        status: 'approved',
      });

      await affiliateSaleRepository.save(affiliateSale);

      // Atualizar estatísticas do afiliado
      affiliate.totalSales += 1;
      affiliate.totalEarnings = parseFloat(affiliate.totalEarnings.toString()) + commissionAmount;
      affiliate.pendingEarnings = parseFloat(affiliate.pendingEarnings.toString()) + commissionAmount;
      await affiliateRepository.save(affiliate);
    }
    
    // Se pagamento foi aprovado, criar matrícula imediatamente
    // Se estiver pendente (PIX/Boleto), criar matrícula será feito via webhook
    let enrollment = null;
    if (paymentResult.status === 'approved') {
      enrollment = enrollmentRepository.create({
        userId: req.user.id,
        courseId: course.id
      });
      
      await enrollmentRepository.save(enrollment);
      
      // Atualizar contador de alunos do curso
      course.totalStudents += 1;
      await courseRepository.save(course);
    }

    // Retornar resposta baseada no método de pagamento
    if (paymentMethod === 'pix' && paymentResult.pixCode) {
      res.status(201).json({
        message: 'Pagamento PIX criado. Escaneie o QR Code para finalizar.',
        sale,
        payment: {
          qrCode: paymentResult.qrCode,
          qrCodeBase64: paymentResult.qrCodeBase64,
          pixCode: paymentResult.pixCode,
        },
        status: 'pending'
      });
      return;
    }

    if (paymentMethod === 'boleto' && paymentResult.boletoUrl) {
      res.status(201).json({
        message: 'Boleto gerado. Pague até a data de vencimento.',
        sale,
        payment: {
          boletoUrl: paymentResult.boletoUrl,
        },
        status: 'pending'
      });
      return;
    }
    
    res.status(201).json({
      message: paymentResult.status === 'approved' 
        ? 'Pagamento processado com sucesso' 
        : 'Pagamento em processamento',
      sale,
      enrollment,
      status: paymentResult.status
    });
  } catch (error: unknown) {
    console.error('Erro ao processar pagamento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao processar pagamento', error: errorMessage });
  }
});

// Obter informações do checkout
router.get('/course/:courseId', async (req: Request<{ courseId: string }>, res: Response) => {
  try {
    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({ where: { id: req.params.courseId } });
    
    if (!course) {
      res.status(404).json({ message: 'Curso não encontrado' });
      return;
    }
    
    res.json({
      course: {
        id: course.id,
        title: course.title,
        price: Number(course.price),
        originalPrice: course.originalPrice ? Number(course.originalPrice) : undefined,
        thumbnail: course.thumbnail,
        instructor: course.instructor
      }
    });
  } catch (error: unknown) {
    console.error('Erro ao buscar informações do checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao buscar informações', error: errorMessage });
  }
});

// Criar Checkout Session do Stripe (embedded)
router.post('/create-checkout-session', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { courseId, affiliateCode } = req.body;
    
    if (!courseId) {
      res.status(400).json({ message: 'courseId é obrigatório' });
      return;
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_API_KEY;
    if (!stripeKey) {
      res.status(500).json({ message: 'Stripe não configurado' });
      return;
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-10-29.clover',
    });

    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({ where: { id: courseId } });
    
    if (!course) {
      res.status(404).json({ message: 'Curso não encontrado' });
      return;
    }

    // Verificar se o usuário já está matriculado
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const existingEnrollment = await enrollmentRepository.findOne({
      where: {
        userId: req.user.id,
        courseId: course.id
      }
    });
    
    if (existingEnrollment) {
      res.status(400).json({ message: 'Você já está matriculado neste curso' });
      return;
    }

    const amountInCents = Math.round(Number(course.price) * 100);
    
    // Validar valor mínimo (Stripe requer pelo menos 0.50 BRL)
    if (amountInCents < 50) {
      res.status(400).json({ 
        message: 'Valor do curso muito baixo. O valor mínimo é R$ 0,50.',
        error: 'INVALID_AMOUNT'
      });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Validar URL da thumbnail
    const thumbnailUrl = course.thumbnail && course.thumbnail.trim() 
      ? [course.thumbnail] 
      : undefined;

    // Criar Checkout Session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: course.title.substring(0, 500), // Limitar tamanho
              description: course.description ? course.description.substring(0, 500) : 'Curso online',
              images: thumbnailUrl,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${frontendUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: req.user.email,
      metadata: {
        courseId: course.id,
        userId: req.user.id,
        affiliateCode: affiliateCode || '',
      },
      payment_method_types: ['card'], // Especificar métodos de pagamento
    });

    if (!session.client_secret) {
      throw new Error('Client secret não foi retornado pelo Stripe');
    }

    res.json({ clientSecret: session.client_secret });
  } catch (error: unknown) {
    console.error('Erro ao criar checkout session:', error);
    
    // Type guard para erros do Stripe
    const isStripeError = (err: unknown): err is { type?: string; code?: string; message?: string; raw?: unknown } => {
      return typeof err === 'object' && err !== null;
    };
    
    const stripeError = isStripeError(error) ? error : null;
    
    console.error('Detalhes do erro:', {
      type: stripeError?.type,
      code: stripeError?.code,
      message: stripeError?.message || (error instanceof Error ? error.message : 'Erro desconhecido'),
      raw: stripeError?.raw
    });
    
    // Mensagem de erro mais específica
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    let finalErrorMessage = 'Erro ao criar sessão de checkout';
    if (stripeError?.type === 'StripeInvalidRequestError') {
      finalErrorMessage = `Erro na requisição ao Stripe: ${errorMessage}`;
    } else if (stripeError?.code === 'resource_missing') {
      finalErrorMessage = 'Recurso não encontrado no Stripe';
    }
    
    res.status(500).json({ 
      message: finalErrorMessage, 
      error: errorMessage,
      code: stripeError?.code,
      type: stripeError?.type
    });
  }
});

// Verificar status da sessão de checkout
router.get('/session-status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { session_id } = req.query;
    
    if (!session_id || typeof session_id !== 'string') {
      res.status(400).json({ message: 'session_id é obrigatório' });
      return;
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_API_KEY;
    if (!stripeKey) {
      res.status(500).json({ message: 'Stripe não configurado' });
      return;
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-10-29.clover',
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });
  } catch (error: unknown) {
    console.error('Erro ao verificar status da sessão:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao verificar status', error: errorMessage });
  }
});

// Webhook para receber notificações de pagamento
// IMPORTANTE: Esta rota recebe raw body (Buffer) quando configurada no server.ts
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // Para Stripe, precisamos do raw body (Buffer) e signature
    const signature = req.headers['stripe-signature'] as string;
    // O body já vem como Buffer quando a rota é registrada com express.raw()
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const webhookData = await paymentService.handleWebhook(rawBody, signature);
    
    if (!webhookData) {
      res.status(400).json({ message: 'Webhook inválido' });
      return;
    }

    const saleRepository = AppDataSource.getRepository(Sale);
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const courseRepository = AppDataSource.getRepository(Course);
    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const affiliateSaleRepository = AppDataSource.getRepository(AffiliateSale);

    // Buscar venda pela transactionId
    const sale = await saleRepository.findOne({ 
      where: { transactionId: webhookData.transactionId } 
    });

    // Webhooks devem sempre retornar 200 para evitar retentativas
    // Mesmo que a venda não seja encontrada, devemos confirmar o recebimento
    if (!sale) {
      // Log para debug quando venda não é encontrada
      console.warn(`Webhook recebido para venda não encontrada: ${webhookData.transactionId}`);
    } else {
      // Processar atualização da venda apenas se encontrada
      // Atualizar status da venda
      const oldStatus = sale.status;
      sale.status = webhookData.status === 'approved' ? 'completed' : 
                    webhookData.status === 'rejected' ? 'failed' : 
                    webhookData.status === 'refunded' ? 'refunded' : sale.status;
      
      await saleRepository.save(sale);

      // Se pagamento foi aprovado e ainda não há matrícula, criar
      if (webhookData.status === 'approved' && oldStatus !== 'completed') {
        const existingEnrollment = await enrollmentRepository.findOne({
          where: {
            userId: sale.studentId,
            courseId: sale.courseId
          }
        });

        if (!existingEnrollment) {
          const enrollment = enrollmentRepository.create({
            userId: sale.studentId,
            courseId: sale.courseId
          });
          
          await enrollmentRepository.save(enrollment);

          // Atualizar contador de alunos
          const course = await courseRepository.findOne({ where: { id: sale.courseId } });
          if (course) {
            course.totalStudents += 1;
            await courseRepository.save(course);
          }

          // Processar comissão do afiliado se houver
          if (sale.affiliateCode) {
            const affiliate = await affiliateRepository.findOne({
              where: { affiliateCode: sale.affiliateCode, status: 'active' }
            });

            if (affiliate) {
              const commissionRate = parseFloat(affiliate.commissionRate.toString()) / 100;
              const commissionAmount = Number(sale.amount) * commissionRate;

              const existingAffiliateSale = await affiliateSaleRepository.findOne({
                where: { saleId: sale.id }
              });

              if (!existingAffiliateSale) {
                const affiliateSale = affiliateSaleRepository.create({
                  affiliateId: affiliate.id,
                  saleId: sale.id,
                  courseId: sale.courseId,
                  studentId: sale.studentId,
                  saleAmount: Number(sale.amount),
                  commissionRate: affiliate.commissionRate,
                  commissionAmount,
                  status: 'approved',
                });

                await affiliateSaleRepository.save(affiliateSale);

                // Atualizar estatísticas do afiliado
                affiliate.totalSales += 1;
                affiliate.totalEarnings = parseFloat(affiliate.totalEarnings.toString()) + commissionAmount;
                affiliate.pendingEarnings = parseFloat(affiliate.pendingEarnings.toString()) + commissionAmount;
                await affiliateRepository.save(affiliate);
              }
            }
          }
        }
      }
    }

    // Sempre retornar 200 para confirmar recebimento do webhook
    res.status(200).json({ message: 'Webhook processado com sucesso' });
  } catch (error: unknown) {
    console.error('Erro ao processar webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao processar webhook', error: errorMessage });
  }
});

export default router;
