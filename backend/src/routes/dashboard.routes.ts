import express, { Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { Enrollment } from '../entities/Enrollment.js';
import { Course } from '../entities/Course.js';
import { In, Not } from 'typeorm';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Obter cursos matriculados do aluno
router.get('/my-courses', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const enrollments = await enrollmentRepository.find({
      where: { userId: req.user.id },
      relations: ['course'],
      order: { lastAccessedAt: 'DESC' }
    });
    
    const coursesWithProgress = enrollments.map(enrollment => {
      const course = enrollment.course as any;
      return {
        ...course,
        progress: enrollment.progress,
        lastAccessedAt: enrollment.lastAccessedAt,
        enrolledAt: enrollment.enrolledAt
      };
    });
    
    res.json(coursesWithProgress);
  } catch (error: any) {
    console.error('Erro ao buscar cursos do aluno:', error);
    res.status(500).json({ message: 'Erro ao buscar cursos', error: error.message });
  }
});

// Obter estatísticas do dashboard
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const enrollments = await enrollmentRepository.find({
      where: { userId: req.user.id }
    });
    
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
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
});

// Obter cursos recomendados
router.get('/recommendations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const courseRepository = AppDataSource.getRepository(Course);
    
    // Buscar cursos em que o aluno não está matriculado
    const enrollments = await enrollmentRepository.find({
      where: { userId: req.user.id }
    });
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    
    const recommendations = await courseRepository.find({
      where: enrolledCourseIds.length > 0
        ? { id: Not(In(enrolledCourseIds)), status: 'published' }
        : { status: 'published' },
      relations: ['instructorUser'],
      order: { totalStudents: 'DESC', rating: 'DESC' },
      take: 4
    });
    
    res.json(recommendations);
  } catch (error: any) {
    console.error('Erro ao buscar recomendações:', error);
    res.status(500).json({ message: 'Erro ao buscar recomendações', error: error.message });
  }
});

export default router;
