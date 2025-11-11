import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { Course } from '../entities/Course.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

interface CourseQuery {
  search?: string;
  category?: string;
  level?: string;
  page?: string;
  limit?: string;
  includeDraft?: string; // Novo parâmetro para incluir rascunhos (apenas para usuários autenticados)
}

// Listar todos os cursos (com filtros e busca)
router.get('/', async (req: Request<{}, {}, {}, CourseQuery>, res: Response) => {
  try {
    const { search, category, level, page = '1', limit = '20', includeDraft } = req.query;
    
    const courseRepository = AppDataSource.getRepository(Course);
    const queryBuilder = courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructorUser', 'instructor');
    
    // Por padrão, mostrar apenas cursos publicados
    // Se includeDraft=true e o usuário estiver autenticado, mostrar todos
    if (includeDraft !== 'true') {
      queryBuilder.where('course.status = :status', { status: 'published' });
    }
    
    // Filtro por categoria
    if (category && category !== 'Todos') {
      queryBuilder.andWhere('course.category = :category', { category });
    }
    
    // Filtro por nível
    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }
    
    // Busca por título ou descrição
    if (search) {
      queryBuilder.andWhere(
        '(course.title ILIKE :search OR course.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const [courses, total] = await queryBuilder
      .orderBy('course.createdAt', 'DESC')
      .skip(skip)
      .take(limitNum)
      .getManyAndCount();
    
    res.json({
      courses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar cursos:', error);
    res.status(500).json({ message: 'Erro ao buscar cursos', error: error.message });
  }
});

// Obter curso por ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({
      where: { id: req.params.id },
      relations: ['instructorUser']
    });
    
    if (!course) {
      res.status(404).json({ message: 'Curso não encontrado' });
      return;
    }
    
    res.json(course);
  } catch (error: any) {
    console.error('Erro ao buscar curso:', error);
    res.status(500).json({ message: 'Erro ao buscar curso', error: error.message });
  }
});

// Criar novo curso (todos os usuários autenticados)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const courseRepository = AppDataSource.getRepository(Course);
    const course = courseRepository.create({
      ...req.body,
      instructorId: req.user.id,
      instructor: req.user.name,
      instructorAvatar: req.user.avatar
    });
    
    await courseRepository.save(course);
    
    res.status(201).json(course);
  } catch (error: any) {
    console.error('Erro ao criar curso:', error);
    res.status(500).json({ message: 'Erro ao criar curso', error: error.message });
  }
});

// Atualizar curso (apenas o criador do curso)
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({ where: { id: req.params.id } });
    
    if (!course) {
      res.status(404).json({ message: 'Curso não encontrado' });
      return;
    }
    
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Você não tem permissão para editar este curso' });
      return;
    }
    
    Object.assign(course, req.body);
    await courseRepository.save(course);
    
    res.json(course);
  } catch (error: any) {
    console.error('Erro ao atualizar curso:', error);
    res.status(500).json({ message: 'Erro ao atualizar curso', error: error.message });
  }
});

// Deletar curso (apenas o criador do curso)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({ where: { id: req.params.id } });
    
    if (!course) {
      res.status(404).json({ message: 'Curso não encontrado' });
      return;
    }
    
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Você não tem permissão para deletar este curso' });
      return;
    }
    
    await courseRepository.remove(course);
    
    res.json({ message: 'Curso deletado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar curso:', error);
    res.status(500).json({ message: 'Erro ao deletar curso', error: error.message });
  }
});

// Obter cursos do usuário (todos os usuários autenticados)
router.get('/creator/my-courses', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const courseRepository = AppDataSource.getRepository(Course);
    const courses = await courseRepository.find({
      where: { instructorId: req.user.id },
      order: { createdAt: 'DESC' }
    });
    
    res.json(courses);
  } catch (error: any) {
    console.error('Erro ao buscar cursos do criador:', error);
    res.status(500).json({ message: 'Erro ao buscar cursos', error: error.message });
  }
});

export default router;
