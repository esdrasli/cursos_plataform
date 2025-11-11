import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { Course } from '../entities/Course.js';
import { Sale } from '../entities/Sale.js';
import { Enrollment } from '../entities/Enrollment.js';
import { Affiliate } from '../entities/Affiliate.js';
import { AffiliateSale } from '../entities/AffiliateSale.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

interface ProcessPaymentBody {
  courseId: string;
  paymentMethod: 'credit' | 'pix' | 'boleto';
  paymentData?: any;
  affiliateCode?: string; // Código do afiliado
}

// Processar pagamento
router.post('/process', authenticate, async (req: AuthRequest<{}, {}, ProcessPaymentBody>, res: Response) => {
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

    // Criar registro de venda
    const sale = saleRepository.create({
      courseId: course.id,
      courseTitle: course.title,
      studentId: req.user.id,
      studentName: req.user.name,
      instructorId: course.instructorId,
      amount: Number(course.price),
      paymentMethod,
      status: 'completed', // Em produção, isso seria verificado pela API de pagamento
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    
    // Criar matrícula
    const enrollment = enrollmentRepository.create({
      userId: req.user.id,
      courseId: course.id
    });
    
    await enrollmentRepository.save(enrollment);
    
    // Atualizar contador de alunos do curso
    course.totalStudents += 1;
    await courseRepository.save(course);
    
    res.status(201).json({
      message: 'Pagamento processado com sucesso',
      sale,
      enrollment
    });
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ message: 'Erro ao processar pagamento', error: error.message });
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
  } catch (error: any) {
    console.error('Erro ao buscar informações do checkout:', error);
    res.status(500).json({ message: 'Erro ao buscar informações', error: error.message });
  }
});

export default router;
