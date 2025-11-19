/* eslint-env node */
/* global process, console */
import express from 'express';
import Course from '../models/Course.js';
import Sale from '../models/Sale.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.middleware.js';
import Stripe from 'stripe';

const router = express.Router();

// Processar pagamento
router.post('/process', authenticate, async (req, res) => {
  try {
    const { courseId, paymentMethod } = req.body;
    
    if (!courseId || !paymentMethod) {
      return res.status(400).json({ message: 'courseId e paymentMethod são obrigatórios' });
    }
    
    // Buscar curso
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }
    
    // Verificar se o usuário já está matriculado
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: course._id
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Você já está matriculado neste curso' });
    }
    
    // Criar registro de venda
    const sale = new Sale({
      courseId: course._id,
      courseTitle: course.title,
      studentId: req.user._id,
      studentName: req.user.name,
      instructorId: course.instructorId,
      amount: course.price,
      paymentMethod,
      status: 'completed', // Em produção, isso seria verificado pela API de pagamento
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    
    await sale.save();
    
    // Criar matrícula
    const enrollment = new Enrollment({
      userId: req.user._id,
      courseId: course._id
    });
    
    await enrollment.save();
    
    // Adicionar curso aos cursos matriculados do usuário
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: course._id }
    });
    
    // Atualizar contador de alunos do curso
    await Course.findByIdAndUpdate(course._id, {
      $inc: { totalStudents: 1 }
    });
    
    res.status(201).json({
      message: 'Pagamento processado com sucesso',
      sale,
      enrollment
    });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ message: 'Erro ao processar pagamento', error: error.message });
  }
});

// Obter informações do checkout
router.get('/course/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }
    
    res.json({
      course: {
        id: course._id,
        title: course.title,
        price: course.price,
        originalPrice: course.originalPrice,
        thumbnail: course.thumbnail,
        instructor: course.instructor
      }
    });
  } catch (error) {
    console.error('Erro ao buscar informações do checkout:', error);
    res.status(500).json({ message: 'Erro ao buscar informações', error: error.message });
  }
});

// Criar Checkout Session do Stripe (embedded)
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { courseId, affiliateCode } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ message: 'courseId é obrigatório' });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_API_KEY;
    if (!stripeKey) {
      return res.status(500).json({ message: 'Stripe não configurado' });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    });

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }

    // Verificar se o usuário já está matriculado
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: course._id
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Você já está matriculado neste curso' });
    }

    const amountInCents = Math.round(Number(course.price) * 100);
    
    // Validar valor mínimo (Stripe requer pelo menos 0.50 BRL)
    if (amountInCents < 50) {
      return res.status(400).json({ 
        message: 'Valor do curso muito baixo. O valor mínimo é R$ 0,50.',
        error: 'INVALID_AMOUNT'
      });
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
        courseId: course._id.toString(),
        userId: req.user._id.toString(),
        affiliateCode: affiliateCode || '',
      },
      payment_method_types: ['card'], // Especificar métodos de pagamento
    });

    if (!session.client_secret) {
      throw new Error('Client secret não foi retornado pelo Stripe');
    }

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Erro ao criar checkout session:', error);
    console.error('Detalhes do erro:', {
      type: error.type,
      code: error.code,
      message: error.message,
      raw: error.raw
    });
    
    // Mensagem de erro mais específica
    let errorMessage = 'Erro ao criar sessão de checkout';
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Erro na requisição ao Stripe: ${error.message}`;
    } else if (error.code === 'resource_missing') {
      errorMessage = 'Recurso não encontrado no Stripe';
    }
    
    res.status(500).json({ 
      message: errorMessage, 
      error: error.message,
      code: error.code,
      type: error.type
    });
  }
});

// Verificar status da sessão de checkout
router.get('/session-status', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { session_id } = req.query;
    
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ message: 'session_id é obrigatório' });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_API_KEY;
    if (!stripeKey) {
      return res.status(500).json({ message: 'Stripe não configurado' });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('Erro ao verificar status da sessão:', error);
    res.status(500).json({ message: 'Erro ao verificar status', error: error.message });
  }
});

export default router;

