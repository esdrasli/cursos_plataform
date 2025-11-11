import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Obter informações do curso para aprendizado
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    // Verificar se o aluno está matriculado
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: req.params.courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'Você não está matriculado neste curso' });
    }
    
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }
    
    // Marcar como último acesso
    enrollment.lastAccessedAt = Date.now();
    await enrollment.save();
    
    // Marcar lições como bloqueadas/desbloqueadas baseado no progresso
    const courseObj = course.toObject();
    courseObj.modules = courseObj.modules.map((module, moduleIndex) => {
      module.lessons = module.lessons.map((lesson, lessonIndex) => {
        const isCompleted = enrollment.completedLessons.some(
          cl => cl.moduleId === module.id && cl.lessonId === lesson.id
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
              cl => cl.moduleId === module.id && cl.lessonId === prevLesson.id
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
  } catch (error) {
    console.error('Erro ao buscar curso para aprendizado:', error);
    res.status(500).json({ message: 'Erro ao buscar curso', error: error.message });
  }
});

// Marcar lição como concluída
router.post('/complete-lesson', authenticate, async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.body;
    
    if (!courseId || !moduleId || !lessonId) {
      return res.status(400).json({ message: 'courseId, moduleId e lessonId são obrigatórios' });
    }
    
    // Verificar se o aluno está matriculado
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'Você não está matriculado neste curso' });
    }
    
    // Verificar se a lição já foi completada
    const alreadyCompleted = enrollment.completedLessons.some(
      cl => cl.moduleId === moduleId && cl.lessonId === lessonId
    );
    
    if (!alreadyCompleted) {
      enrollment.completedLessons.push({
        moduleId,
        lessonId,
        completedAt: Date.now()
      });
      
      // Calcular novo progresso
      const course = await Course.findById(courseId);
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      
      await enrollment.save();
    }
    
    res.json({
      message: 'Lições concluída com sucesso',
      progress: enrollment.progress
    });
  } catch (error) {
    console.error('Erro ao marcar lição como concluída:', error);
    res.status(500).json({ message: 'Erro ao marcar lição como concluída', error: error.message });
  }
});

// Obter progresso do curso
router.get('/progress/:courseId', authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: req.params.courseId
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Matrícula não encontrada' });
    }
    
    res.json({
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons.length,
      lastAccessedAt: enrollment.lastAccessedAt
    });
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ message: 'Erro ao buscar progresso', error: error.message });
  }
});

export default router;

