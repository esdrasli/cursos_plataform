/* global console */
import express from 'express';
import Course from '../models/Course.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Listar todos os cursos (com filtros e busca)
router.get('/', async (req, res) => {
  try {
    const { search, category, level, page = 1, limit = 20 } = req.query;
    
    const query = { status: 'published' };
    
    // Filtro por categoria
    if (category && category !== 'Todos') {
      query.category = category;
    }
    
    // Filtro por nível
    if (level) {
      query.level = level;
    }
    
    // Busca por título ou descrição
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const courses = await Course.find(query)
      .populate('instructorId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Course.countDocuments(query);
    
    res.json({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    res.status(500).json({ message: 'Erro ao buscar cursos', error: error.message });
  }
});

// Obter curso por ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructorId', 'name avatar email');
    
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    res.status(500).json({ message: 'Erro ao buscar curso', error: error.message });
  }
});

// Criar novo curso (apenas criadores)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'creator' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas criadores podem criar cursos' });
    }
    
    const courseData = {
      ...req.body,
      instructorId: req.user._id,
      instructor: req.user.name,
      instructorAvatar: req.user.avatar
    };
    
    const course = new Course(courseData);
    await course.save();
    
    res.status(201).json(course);
  } catch (error) {
    console.error('Erro ao criar curso:', error);
    res.status(500).json({ message: 'Erro ao criar curso', error: error.message });
  }
});

// Atualizar curso (apenas o criador do curso)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }
    
    if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Você não tem permissão para editar este curso' });
    }
    
    Object.assign(course, req.body);
    course.updatedAt = Date.now();
    await course.save();
    
    res.json(course);
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    res.status(500).json({ message: 'Erro ao atualizar curso', error: error.message });
  }
});

// Deletar curso (apenas o criador do curso)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }
    
    if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Você não tem permissão para deletar este curso' });
    }
    
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Curso deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar curso:', error);
    res.status(500).json({ message: 'Erro ao deletar curso', error: error.message });
  }
});

// Obter cursos do criador
router.get('/creator/my-courses', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'creator' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas criadores podem acessar esta rota' });
    }
    
    const courses = await Course.find({ instructorId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Erro ao buscar cursos do criador:', error);
    res.status(500).json({ message: 'Erro ao buscar cursos', error: error.message });
  }
});

export default router;

