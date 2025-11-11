import express, { Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { Enrollment } from '../entities/Enrollment.js';
import { Course } from '../entities/Course.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

interface CompleteLessonBody {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

// Obter informações do curso para aprendizado
router.get('/course/:courseId', authenticate, async (req: AuthRequest<{ courseId: string }>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const courseRepository = AppDataSource.getRepository(Course);

    // Verificar se o aluno está matriculado
    const enrollment = await enrollmentRepository.findOne({
      where: {
        userId: req.user.id,
        courseId: req.params.courseId
      }
    });
    
    if (!enrollment) {
      res.status(403).json({ message: 'Você não está matriculado neste curso' });
      return;
    }
    
    const course = await courseRepository.findOne({ where: { id: req.params.courseId } });
    if (!course) {
      res.status(404).json({ message: 'Curso não encontrado' });
      return;
    }
    
    // Marcar como último acesso
    enrollment.lastAccessedAt = new Date();
    await enrollmentRepository.save(enrollment);
    
    // Marcar lições como bloqueadas/desbloqueadas baseado no progresso
    const courseObj = JSON.parse(JSON.stringify(course));
    courseObj.modules = courseObj.modules.map((module: any, moduleIndex: number) => {
      module.lessons = module.lessons.map((lesson: any, lessonIndex: number) => {
        const isCompleted = enrollment.completedLessons.some(
          (cl: any) => cl.moduleId === module.id && cl.lessonId === lesson.id
        );
        
        // Desbloquear primeira lição do primeiro módulo
        if (moduleIndex === 0 && lessonIndex === 0) {
          lesson.locked = false;
        } else {
          // Desbloquear se a lição anterior foi completada
          const prevLesson = moduleIndex === 0 && lessonIndex > 0
            ? courseObj.modules[0].lessons[lessonIndex - 1]
            : null;
          
          if (prevLesson) {
            const prevCompleted = enrollment.completedLessons.some(
              (cl: any) => cl.moduleId === module.id && cl.lessonId === prevLesson.id
            );
            lesson.locked = !prevCompleted;
          } else {
            lesson.locked = true;
          }
        }
        
        lesson.completed = isCompleted;
        return lesson;
      });
      return module;
    });
    
    res.json({
      course: courseObj,
      enrollment: {
        progress: enrollment.progress,
        lastAccessedAt: enrollment.lastAccessedAt
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar curso para aprendizado:', error);
    res.status(500).json({ message: 'Erro ao buscar curso', error: error.message });
  }
});

// Marcar lição como concluída
router.post('/complete-lesson', authenticate, async (req: AuthRequest<{}, {}, CompleteLessonBody>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { courseId, moduleId, lessonId } = req.body;
    
    if (!courseId || !moduleId || !lessonId) {
      res.status(400).json({ message: 'courseId, moduleId e lessonId são obrigatórios' });
      return;
    }
    
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const courseRepository = AppDataSource.getRepository(Course);
    
    // Verificar se o aluno está matriculado
    const enrollment = await enrollmentRepository.findOne({
      where: {
        userId: req.user.id,
        courseId
      }
    });
    
    if (!enrollment) {
      res.status(403).json({ message: 'Você não está matriculado neste curso' });
      return;
    }
    
    // Verificar se a lição já foi completada
    const alreadyCompleted = enrollment.completedLessons.some(
      (cl: any) => cl.moduleId === moduleId && cl.lessonId === lessonId
    );
    
    if (!alreadyCompleted) {
      enrollment.completedLessons.push({
        moduleId,
        lessonId,
        completedAt: new Date()
      });
      
      // Calcular novo progresso
      const course = await courseRepository.findOne({ where: { id: courseId } });
      if (!course) {
        res.status(404).json({ message: 'Curso não encontrado' });
        return;
      }

      const totalLessons = course.modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0);
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      
      await enrollmentRepository.save(enrollment);
    }
    
    res.json({
      message: 'Lições concluída com sucesso',
      progress: enrollment.progress
    });
  } catch (error: any) {
    console.error('Erro ao marcar lição como concluída:', error);
    res.status(500).json({ message: 'Erro ao marcar lição como concluída', error: error.message });
  }
});

// Obter progresso do curso
router.get('/progress/:courseId', authenticate, async (req: AuthRequest<{ courseId: string }>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const enrollment = await enrollmentRepository.findOne({
      where: {
        userId: req.user.id,
        courseId: req.params.courseId
      }
    });
    
    if (!enrollment) {
      res.status(404).json({ message: 'Matrícula não encontrada' });
      return;
    }
    
    res.json({
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons.length,
      lastAccessedAt: enrollment.lastAccessedAt
    });
  } catch (error: any) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ message: 'Erro ao buscar progresso', error: error.message });
  }
});

export default router;
