import express, { Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { Sale } from '../entities/Sale.js';
import { Enrollment } from '../entities/Enrollment.js';
import { LandingPage } from '../entities/LandingPage.js';
import { Course } from '../entities/Course.js';
import { User } from '../entities/User.js';
import { AppConfig } from '../entities/AppConfig.js';
import { MoreThanOrEqual, In } from 'typeorm';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest, IHero } from '../types/index.js';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticate);

interface CreatorQuery {
  search?: string;
  page?: string | number;
  limit?: string | number;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface ColorPalettes {
  primary: ColorPalette;
  bold: ColorPalette;
  elegant: ColorPalette;
  vibrant: ColorPalette;
}

interface GeneratedAIContent {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    image: string;
  };
  sections: Array<{
    type: string;
    content: string;
  }>;
  layout: {
    heroLayout: 'centered' | 'split' | 'minimal';
    heroBackground: 'gradient' | 'solid' | 'image';
    colorScheme: 'primary' | 'bold' | 'elegant' | 'vibrant';
    colors: Record<string, string>;
    typography: 'bold' | 'elegant' | 'modern';
    spacing: 'compact' | 'comfortable' | 'spacious';
    ctaStyle: 'small' | 'medium' | 'large';
    ctaPosition: 'left' | 'center' | 'right';
  };
}

interface CreateLandingPageBody {
  title: string;
  courseId: string;
  hero: IHero;
  status?: 'Publicada' | 'Rascunho';
  sections?: unknown[];
  layout?: unknown;
}

// ========== DASHBOARD ==========
router.get('/dashboard/stats', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const courseRepository = AppDataSource.getRepository(Course);
    const saleRepository = AppDataSource.getRepository(Sale);
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);

    const courses = await courseRepository.find({
      where: { instructorId: req.user.id }
    });
    const courseIds = courses.map(c => c.id);
    
    // Vendas do mês atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const salesThisMonth = await saleRepository.find({
      where: {
        instructorId: req.user.id,
        status: 'completed',
        createdAt: MoreThanOrEqual(startOfMonth)
      }
    });
    
    const totalRevenue = salesThisMonth.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const totalSales = salesThisMonth.length;
    
    // Novos alunos do mês
    const enrollmentsThisMonth = await enrollmentRepository.find({
      where: {
        courseId: In(courseIds),
        enrolledAt: MoreThanOrEqual(startOfMonth)
      }
    });
    
    const newStudents = enrollmentsThisMonth.length;
    
    // Receita total (todas as vendas)
    const allSales = await saleRepository.find({
      where: {
        instructorId: req.user.id,
        status: 'completed'
      }
    });
    const totalRevenueAllTime = allSales.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const totalSalesAllTime = allSales.length;

    // Total de alunos (todos os tempos)
    const allEnrollments = await enrollmentRepository.find({
      where: { courseId: In(courseIds) }
    });
    const totalStudents = new Set(allEnrollments.map(e => e.userId)).size;

    // Receita por curso
    const revenueByCourse = courses.map(course => {
      const courseSales = allSales.filter(s => s.courseId === course.id);
      const courseRevenue = courseSales.reduce((sum, sale) => sum + Number(sale.amount), 0);
      const courseEnrollments = allEnrollments.filter(e => e.courseId === course.id);
      return {
        courseId: course.id,
        courseTitle: course.title,
        revenue: courseRevenue,
        sales: courseSales.length,
        students: courseEnrollments.length,
        price: Number(course.price)
      };
    });

    // Vendas dos últimos 7 dias
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const salesLast7Days = await saleRepository.find({
      where: {
        instructorId: req.user.id,
        status: 'completed',
        createdAt: MoreThanOrEqual(sevenDaysAgo)
      }
    });
    const revenueLast7Days = salesLast7Days.reduce((sum, sale) => sum + Number(sale.amount), 0);

    // Vendas dos últimos 30 dias
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const salesLast30Days = await saleRepository.find({
      where: {
        instructorId: req.user.id,
        status: 'completed',
        createdAt: MoreThanOrEqual(thirtyDaysAgo)
      }
    });
    const revenueLast30Days = salesLast30Days.reduce((sum, sale) => sum + Number(sale.amount), 0);

    res.json({
      // Estatísticas do mês atual
      totalRevenue,
      totalSales,
      newStudents,
      totalCourses: courses.length,
      // Estatísticas gerais
      totalRevenueAllTime,
      totalSalesAllTime,
      totalStudents,
      // Estatísticas por período
      revenueLast7Days,
      salesLast7Days: salesLast7Days.length,
      revenueLast30Days,
      salesLast30Days: salesLast30Days.length,
      // Receita por curso
      revenueByCourse
    });
  } catch (error: unknown) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: errorMessage });
  }
});

// ========== ESTATÍSTICAS POR CURSO ==========
router.get('/courses/stats', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const courseRepository = AppDataSource.getRepository(Course);
    const saleRepository = AppDataSource.getRepository(Sale);
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);

    const courses = await courseRepository.find({
      where: { instructorId: req.user.id },
      order: { createdAt: 'DESC' }
    });

    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Vendas do curso
        const sales = await saleRepository.find({
          where: {
            courseId: course.id,
            status: 'completed'
          }
        });
        const revenue = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
        
        // Matrículas do curso
        const enrollments = await enrollmentRepository.find({
          where: { courseId: course.id }
        });
        
        // Progresso médio dos alunos
        const avgProgress = enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
          : 0;

        // Vendas do mês atual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const salesThisMonth = sales.filter(s => new Date(s.createdAt) >= startOfMonth);
        const revenueThisMonth = salesThisMonth.reduce((sum, sale) => sum + Number(sale.amount), 0);

        // Última venda
        const lastSale = sales.length > 0 
          ? sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
          : null;

        return {
          course: {
            id: course.id,
            title: course.title,
            thumbnail: course.thumbnail,
            price: Number(course.price),
            status: course.status,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
          },
          stats: {
            totalRevenue: revenue,
            totalSales: sales.length,
            totalStudents: enrollments.length,
            avgProgress: Math.round(avgProgress),
            revenueThisMonth,
            salesThisMonth: salesThisMonth.length,
            lastSaleDate: lastSale?.createdAt || null
          }
        };
      })
    );

    res.json(coursesWithStats);
  } catch (error: unknown) {
    console.error('Erro ao buscar estatísticas por curso:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: errorMessage });
  }
});

// ========== VENDAS ==========
router.get('/sales', async (req: AuthRequest<never, never, never, CreatorQuery>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { search, page = 1, limit = 20 } = req.query;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;
    const skip = (pageNum - 1) * limitNum;
    
    const saleRepository = AppDataSource.getRepository(Sale);
    const landingPageRepository = AppDataSource.getRepository(LandingPage);
    
    const queryBuilder = saleRepository
      .createQueryBuilder('sale')
      .where('sale.instructorId = :instructorId', { instructorId: req.user.id })
      .leftJoinAndSelect('sale.student', 'student')
      .leftJoinAndSelect('sale.course', 'course');
    
    if (search) {
      queryBuilder.andWhere(
        '(sale.courseTitle ILIKE :search OR sale.studentName ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    const [sales, total] = await queryBuilder
      .orderBy('sale.createdAt', 'DESC')
      .skip(skip)
      .take(limitNum)
      .getManyAndCount();
    
    // Buscar landing pages associadas aos cursos das vendas
    const courseIds = sales.map(sale => sale.courseId).filter(Boolean);
    let landingPages: LandingPage[] = [];
    
    if (courseIds.length > 0) {
      // Usar In do TypeORM corretamente
      landingPages = await landingPageRepository.find({
        where: { courseId: In(courseIds) }
      });
    }
    
    // Mapear landing pages por courseId
    const landingPagesByCourseId = landingPages.reduce((acc, page) => {
      acc[page.courseId] = page;
      return acc;
    }, {} as Record<string, LandingPage>);
    
    // Adicionar informações de landing page às vendas
    const salesWithLandingPages = sales.map(sale => ({
      ...sale,
      landingPage: landingPagesByCourseId[sale.courseId] || null
    }));
    
    res.json({
      sales: salesWithLandingPages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: unknown) {
    console.error('Erro ao buscar vendas:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao buscar vendas', error: errorMessage });
  }
});

// ========== ALUNOS ==========
router.get('/students', async (req: AuthRequest<never, never, never, CreatorQuery>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { search, page = 1, limit = 20 } = req.query;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;
    const skip = (pageNum - 1) * limitNum;
    
    const courseRepository = AppDataSource.getRepository(Course);
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const saleRepository = AppDataSource.getRepository(Sale);
    
    const courses = await courseRepository.find({
      where: { instructorId: req.user.id }
    });
    const courseIds = courses.map(c => c.id);
    
    const enrollments = await enrollmentRepository.find({
      where: { courseId: In(courseIds) },
      relations: ['course']
    });
    
    // Agrupar por aluno e calcular total gasto
    interface StudentData {
      id: string;
      name: string;
      email: string;
      avatar: string;
      enrolledDate: Date;
      totalSpent: number;
      courses: string[];
    }
    
    const studentMap = new Map<string, StudentData>();
    
    // Buscar dados dos usuários
    const userIds = [...new Set(enrollments.map(e => e.userId))];
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      where: { id: In(userIds) }
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    enrollments.forEach((enrollment: Enrollment) => {
      const userId = enrollment.userId;
      const student = userMap.get(userId);
      
      if (!student || !studentMap.has(userId)) {
        if (student) {
          studentMap.set(userId, {
            id: userId,
            name: student.name,
            email: student.email,
            avatar: student.avatar,
            enrolledDate: enrollment.enrolledAt,
            totalSpent: 0,
            courses: []
          });
        }
      }
      
      const studentData = studentMap.get(userId);
      if (studentData && enrollment.course) {
        studentData.courses.push(enrollment.course.title);
      }
    });
    
    // Buscar vendas para calcular total gasto
    const studentIds = Array.from(studentMap.keys());
    const sales = await saleRepository.find({
      where: {
        studentId: In(studentIds),
        courseId: In(courseIds),
        status: 'completed'
      }
    });
    
    sales.forEach(sale => {
      const studentId = sale.studentId;
      if (studentMap.has(studentId)) {
        const studentData = studentMap.get(studentId)!;
        studentData.totalSpent += Number(sale.amount);
      }
    });
    
    let students = Array.from(studentMap.values());
    
    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Ordenar por data de inscrição
    students.sort((a, b) => new Date(b.enrolledDate).getTime() - new Date(a.enrolledDate).getTime());
    
    const total = students.length;
    students = students.slice(skip, skip + limitNum);
    
    res.json({
      students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: unknown) {
    console.error('Erro ao buscar alunos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao buscar alunos', error: errorMessage });
  }
});

// ========== LANDING PAGES ==========
router.get('/landing-pages', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const landingPageRepository = AppDataSource.getRepository(LandingPage);
    const landingPages = await landingPageRepository.find({
      where: { creatorId: req.user.id },
      relations: ['course'],
      order: { createdAt: 'DESC' }
    });
    
    res.json(landingPages);
  } catch (error: unknown) {
    console.error('Erro ao buscar landing pages:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao buscar landing pages', error: errorMessage });
  }
});

router.get('/landing-pages/:id', async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const landingPageRepository = AppDataSource.getRepository(LandingPage);
    const landingPage = await landingPageRepository.findOne({
      where: {
        id: req.params.id,
        creatorId: req.user.id
      },
      relations: ['course']
    });
    
    if (!landingPage) {
      res.status(404).json({ message: 'Landing page não encontrada' });
      return;
    }
    
    res.json(landingPage);
  } catch (error: unknown) {
    console.error('Erro ao buscar landing page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao buscar landing page', error: errorMessage });
  }
});

router.post('/landing-pages', async (req: AuthRequest<never, never, CreateLandingPageBody>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { title, courseId, hero, status, sections, layout } = req.body;
    
    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({
      where: {
        id: courseId,
        instructorId: req.user.id
      }
    });
    
    if (!course) {
      res.status(404).json({ message: 'Curso não encontrado ou você não tem permissão' });
      return;
    }
    
    const landingPageRepository = AppDataSource.getRepository(LandingPage);
    const landingPage = landingPageRepository.create({
      title,
      courseId: course.id,
      courseTitle: course.title,
      creatorId: req.user.id,
      hero,
      sections: sections || [],
      layout: layout || null,
      status: status || 'Rascunho'
    });
    
    await landingPageRepository.save(landingPage);
    
    res.status(201).json(landingPage);
  } catch (error: unknown) {
    console.error('Erro ao criar landing page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao criar landing page', error: errorMessage });
  }
});

router.put('/landing-pages/:id', async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const landingPageRepository = AppDataSource.getRepository(LandingPage);
    const landingPage = await landingPageRepository.findOne({
      where: {
        id: req.params.id,
        creatorId: req.user.id
      }
    });
    
    if (!landingPage) {
      res.status(404).json({ message: 'Landing page não encontrada' });
      return;
    }
    
    Object.assign(landingPage, req.body);
    await landingPageRepository.save(landingPage);
    
    res.json(landingPage);
  } catch (error: unknown) {
    console.error('Erro ao atualizar landing page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao atualizar landing page', error: errorMessage });
  }
});

router.delete('/landing-pages/:id', async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const landingPageRepository = AppDataSource.getRepository(LandingPage);
    const landingPage = await landingPageRepository.findOne({
      where: {
        id: req.params.id,
        creatorId: req.user.id
      }
    });
    
    if (!landingPage) {
      res.status(404).json({ message: 'Landing page não encontrada' });
      return;
    }
    
    await landingPageRepository.remove(landingPage);
    
    res.json({ message: 'Landing page deletada com sucesso' });
  } catch (error: unknown) {
    console.error('Erro ao deletar landing page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao deletar landing page', error: errorMessage });
  }
});

// ========== IA - GERAÇÃO DE CONTEÚDO ==========
interface GenerateAIContentBody {
  prompt: string;
  courseTitle?: string;
  courseDescription?: string;
}

router.post('/ai/generate-content', async (req: AuthRequest<never, never, GenerateAIContentBody>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { prompt, courseTitle } = req.body;

    if (!prompt || !prompt.trim()) {
      res.status(400).json({ message: 'Prompt é obrigatório' });
      return;
    }

    // Gerar conteúdo inteligente baseado em templates e análise do prompt
    const aiContent = await generateSmartContent(prompt, courseTitle);
    res.json(aiContent);
  } catch (error: unknown) {
    console.error('Erro ao gerar conteúdo com IA:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao gerar conteúdo', error: errorMessage });
  }
});

// Função para gerar conteúdo inteligente baseado em templates e análise do prompt
async function generateSmartContent(
  prompt: string,
  courseTitle?: string
): Promise<GeneratedAIContent> {
  // Buscar configurações do banco de dados
  const configRepository = AppDataSource.getRepository(AppConfig);
  const configs = await configRepository.find({
    where: { category: 'ai' }
  });

  // Converter para objeto
  const aiConfig: Record<string, string | number | boolean | object> = {};
  configs.forEach(config => {
    let value: string | number | boolean | object = config.value;
    switch (config.type) {
      case 'number':
        value = parseFloat(config.value) || 0;
        break;
      case 'boolean':
        value = config.value === 'true' || config.value === '1';
        break;
      case 'json':
        try {
          value = JSON.parse(config.value);
        } catch {
          value = config.value;
        }
        break;
    }
    aiConfig[config.key] = value;
  });

  // Usar configurações do banco ou valores padrão
  const defaultColorPalettes: ColorPalettes = {
    primary: {
      primary: '#4F46E5',
      secondary: '#7C3AED',
      accent: '#EC4899',
      background: '#FFFFFF',
      text: '#1F2937',
    },
    bold: {
      primary: '#DC2626',
      secondary: '#EA580C',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#111827',
    },
    elegant: {
      primary: '#1F2937',
      secondary: '#4B5563',
      accent: '#6B7280',
      background: '#F9FAFB',
      text: '#111827',
    },
    vibrant: {
      primary: '#10B981',
      secondary: '#3B82F6',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      text: '#1F2937',
    },
  };

  // Type guard para verificar se colorPalettes do banco tem a estrutura correta
  const isColorPalettes = (value: unknown): value is ColorPalettes => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'primary' in value &&
      typeof (value as Record<string, unknown>).primary === 'object' &&
      (value as Record<string, unknown>).primary !== null &&
      'bold' in value &&
      typeof (value as Record<string, unknown>).bold === 'object' &&
      (value as Record<string, unknown>).bold !== null
    );
  };

  const colorPalettes: ColorPalettes = isColorPalettes(aiConfig.colorPalettes)
    ? aiConfig.colorPalettes
    : defaultColorPalettes;

  const defaultHeroImage = (typeof aiConfig.defaultHeroImage === 'string' ? aiConfig.defaultHeroImage : undefined) || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop';
  const defaultBenefits = (typeof aiConfig.defaultBenefits === 'string' ? aiConfig.defaultBenefits : undefined) || 'Acesso vitalício • Certificado reconhecido • Suporte exclusivo • Atualizações gratuitas • Projetos práticos';

  const title = courseTitle || 'Curso Online';
  const lowerPrompt = prompt.toLowerCase();

  // Analisar o prompt para determinar o tom e foco
  const isEmotional = lowerPrompt.includes('emocional') || lowerPrompt.includes('transformação') || lowerPrompt.includes('mudar');
  const isTechnical = lowerPrompt.includes('técnico') || lowerPrompt.includes('profissional') || lowerPrompt.includes('certificado');
  const isUrgent = lowerPrompt.includes('urgente') || lowerPrompt.includes('limitado') || lowerPrompt.includes('oferta');
  const isResults = lowerPrompt.includes('resultado') || lowerPrompt.includes('prático') || lowerPrompt.includes('prática');

  // Gerar título baseado no contexto
  let generatedTitle = '';
  if (isEmotional) {
    const emotionalTitles = [
      `Transforme sua Carreira com ${title}`,
      `${title}: A Jornada que Vai Mudar sua Vida`,
      `Descubra o Poder de ${title} e Transforme seu Futuro`,
    ];
    generatedTitle = emotionalTitles[Math.floor(Math.random() * emotionalTitles.length)];
  } else if (isTechnical) {
    const technicalTitles = [
      `${title}: Torne-se um Especialista Reconhecido`,
      `Domine ${title} com Certificação Profissional`,
      `${title}: Do Básico ao Avançado`,
    ];
    generatedTitle = technicalTitles[Math.floor(Math.random() * technicalTitles.length)];
  } else if (isResults) {
    const resultsTitles = [
      `${title}: Resultados Práticos desde o Primeiro Dia`,
      `Aprenda ${title} Fazendo Projetos Reais`,
      `${title}: Teoria + Prática = Sucesso Garantido`,
    ];
    generatedTitle = resultsTitles[Math.floor(Math.random() * resultsTitles.length)];
  } else {
    const defaultTitles = [
      `Domine ${title} e Transforme sua Carreira`,
      `${title}: Do Zero ao Profissional`,
      `Aprenda ${title} com o Método Mais Eficaz`,
    ];
    generatedTitle = defaultTitles[Math.floor(Math.random() * defaultTitles.length)];
  }

  // Gerar subtítulo
  let generatedSubtitle = '';
  if (isUrgent) {
    generatedSubtitle = `Oferta por tempo limitado! Não perca esta oportunidade única de transformar sua carreira. Aprenda com os melhores e conquiste resultados reais. Garantia de 7 dias ou seu dinheiro de volta.`;
  } else if (isEmotional) {
    generatedSubtitle = `Junte-se a milhares de pessoas que já transformaram suas vidas com este curso. Descubra o método comprovado que vai te levar do zero ao sucesso profissional. Sua jornada começa aqui.`;
  } else if (isTechnical) {
    generatedSubtitle = `Curso completo e atualizado com as melhores práticas do mercado. Aprenda com projetos reais, receba certificado reconhecido e tenha suporte exclusivo. Tudo que você precisa para se tornar um especialista.`;
  } else {
    generatedSubtitle = `Descubra o método comprovado que já transformou a vida de milhares de alunos. Aprenda na prática, com projetos reais e conquiste resultados desde o primeiro dia. Acesso vitalício e atualizações gratuitas.`;
  }

  // Gerar CTA
  const ctas = isUrgent 
    ? ['Garantir Minha Vaga Agora', 'Quero Aproveitar a Oferta', 'Não Quero Perder Esta Oportunidade']
    : ['Quero Começar Agora', 'Garantir Minha Vaga', 'Quero Me Inscrever'];

  // Analisar prompt para determinar estilo de layout
  const isModern = lowerPrompt.includes('moderno') || lowerPrompt.includes('minimalista') || lowerPrompt.includes('clean');
  const isBold = lowerPrompt.includes('bold') || lowerPrompt.includes('destaque') || lowerPrompt.includes('impacto');
  const isElegant = lowerPrompt.includes('elegante') || lowerPrompt.includes('sofisticado') || lowerPrompt.includes('premium');
  const isColorful = lowerPrompt.includes('colorido') || lowerPrompt.includes('vibrante') || lowerPrompt.includes('energético');

  // Gerar configurações de layout baseadas no contexto
  let layoutConfig: {
    heroLayout: 'centered' | 'split' | 'minimal';
    heroBackground: 'gradient' | 'solid' | 'image';
    colorScheme: 'primary' | 'bold' | 'elegant' | 'vibrant';
    typography: 'bold' | 'elegant' | 'modern';
    spacing: 'compact' | 'comfortable' | 'spacious';
  } = {
    heroLayout: 'centered', // 'centered' | 'split' | 'minimal'
    heroBackground: 'gradient', // 'gradient' | 'solid' | 'image'
    colorScheme: 'primary', // 'primary' | 'bold' | 'elegant' | 'vibrant'
    typography: 'bold', // 'bold' | 'elegant' | 'modern'
    spacing: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
  };

  // Ajustar layout baseado no contexto
  if (isModern) {
    layoutConfig = {
      heroLayout: 'minimal',
      heroBackground: 'solid',
      colorScheme: 'elegant',
      typography: 'modern',
      spacing: 'comfortable',
    };
  } else if (isBold) {
    layoutConfig = {
      heroLayout: 'centered',
      heroBackground: 'gradient',
      colorScheme: 'bold',
      typography: 'bold',
      spacing: 'spacious',
    };
  } else if (isElegant) {
    layoutConfig = {
      heroLayout: 'split',
      heroBackground: 'image',
      colorScheme: 'elegant',
      typography: 'elegant',
      spacing: 'spacious',
    };
  } else if (isColorful) {
    layoutConfig = {
      heroLayout: 'centered',
      heroBackground: 'gradient',
      colorScheme: 'vibrant',
      typography: 'bold',
      spacing: 'comfortable',
    };
  }

  // Usar paleta de cores do banco ou padrão
  const selectedPalette: Record<string, string> = { ...(colorPalettes[layoutConfig.colorScheme] || colorPalettes.primary) };

  return {
    hero: {
      title: generatedTitle,
      subtitle: generatedSubtitle,
      cta: ctas[Math.floor(Math.random() * ctas.length)],
      image: defaultHeroImage,
    },
    sections: [
      {
        type: 'benefits',
        content: defaultBenefits,
      },
    ],
    layout: {
      heroLayout: layoutConfig.heroLayout,
      heroBackground: layoutConfig.heroBackground,
      colorScheme: layoutConfig.colorScheme,
      colors: selectedPalette,
      typography: layoutConfig.typography,
      spacing: layoutConfig.spacing,
      ctaStyle: isUrgent ? 'large' : 'medium', // 'small' | 'medium' | 'large'
      ctaPosition: 'center', // 'left' | 'center' | 'right'
    },
  };
}

export default router;
