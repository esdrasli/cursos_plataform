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
    
    // Validar e truncar campos se necessário para evitar erro 22001
    const courseData: any = {
      title: (req.body.title || '').substring(0, 255),
      description: req.body.description || '',
      thumbnail: (req.body.thumbnail || '').substring(0, 500),
      price: parseFloat(req.body.price) || 0,
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null,
      category: (req.body.category || '').substring(0, 100),
      level: req.body.level || 'Iniciante',
      duration: (req.body.duration || '').substring(0, 100),
      features: Array.isArray(req.body.features) ? req.body.features : [],
      modules: Array.isArray(req.body.modules) ? req.body.modules : [],
      status: req.body.status || 'draft',
      instructorId: req.user.id,
      instructor: (req.user.name || '').substring(0, 255),
      instructorAvatar: (req.user.avatar || 'https://i.pravatar.cc/150?img=1').substring(0, 500),
      // Campos opcionais JSONB
      sections: req.body.sections || null,
      platformConfig: req.body.platformConfig || null,
      customization: req.body.customization || null,
    };
    
    // Validar campos obrigatórios
    if (!courseData.title?.trim()) {
      res.status(400).json({ message: 'Título do curso é obrigatório' });
      return;
    }
    if (!courseData.description?.trim()) {
      res.status(400).json({ message: 'Descrição do curso é obrigatória' });
      return;
    }
    if (!courseData.thumbnail?.trim()) {
      res.status(400).json({ message: 'URL da thumbnail é obrigatória' });
      return;
    }
    if (!courseData.category?.trim()) {
      res.status(400).json({ message: 'Categoria é obrigatória' });
      return;
    }
    
    const courseRepository = AppDataSource.getRepository(Course);
    const course = courseRepository.create(courseData);
    
    await courseRepository.save(course);
    
    res.status(201).json(course);
  } catch (error: any) {
    console.error('Erro ao criar curso:', error);
    console.error('Detalhes do erro:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
      column: error.column,
      table: error.table,
      constraint: error.constraint
    });
    
    // Mensagem de erro mais específica
    if (error.code === '22001') {
      res.status(400).json({ 
        message: 'Um dos campos excede o tamanho máximo permitido. Verifique: título (255), thumbnail (500), categoria (100) ou duração (100).',
        error: error.message,
        column: error.column
      });
    } else if (error.code === '23502') {
      res.status(400).json({ 
        message: 'Campo obrigatório não preenchido.',
        error: error.message,
        column: error.column
      });
    } else {
      res.status(500).json({ 
        message: 'Erro ao criar curso', 
        error: error.message 
      });
    }
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
