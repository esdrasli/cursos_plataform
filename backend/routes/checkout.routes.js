import express from 'express';
import Course from '../models/Course.js';
import Sale from '../models/Sale.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Processar pagamento
router.post('/process', authenticate, async (req, res) => {
  try {
    const { courseId, paymentMethod, paymentData } = req.body;
    
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

export default router;

