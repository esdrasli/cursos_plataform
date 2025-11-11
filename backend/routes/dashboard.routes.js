import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Obter cursos matriculados do aluno
router.get('/my-courses', authenticate, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id })
      .populate('courseId')
      .sort({ lastAccessedAt: -1 });
    
    const coursesWithProgress = enrollments.map(enrollment => {
      const course = enrollment.courseId.toObject();
      return {
        ...course,
        progress: enrollment.progress,
        lastAccessedAt: enrollment.lastAccessedAt,
        enrolledAt: enrollment.enrolledAt
      };
    });
    
    res.json(coursesWithProgress);
  } catch (error) {
    console.error('Erro ao buscar cursos do aluno:', error);
    res.status(500).json({ message: 'Erro ao buscar cursos', error: error.message });
  }
});

// Obter estatísticas do dashboard
router.get('/stats', authenticate, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id });
    
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const inProgressCourses = totalCourses - completedCourses;
    
    // Calcular progresso médio
    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
      : 0;
    
    res.json({
      totalCourses,
      completedCourses,
      inProgressCourses,
      avgProgress: Math.round(avgProgress)
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
});

// Obter cursos recomendados
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    // Buscar cursos em que o aluno não está matriculado
    const enrollments = await Enrollment.find({ userId: req.user._id });
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    
    const recommendations = await Course.find({
      _id: { $nin: enrolledCourseIds },
      status: 'published'
    })
      .sort({ totalStudents: -1, rating: -1 })
      .limit(4)
      .populate('instructorId', 'name avatar');
    
    res.json(recommendations);
  } catch (error) {
    console.error('Erro ao buscar recomendações:', error);
    res.status(500).json({ message: 'Erro ao buscar recomendações', error: error.message });
  }
});

export default router;

