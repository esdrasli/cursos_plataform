import express, { Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { Affiliate } from '../entities/Affiliate.js';
import { AffiliateSale } from '../entities/AffiliateSale.js';
import { Sale } from '../entities/Sale.js';
import { Course } from '../entities/Course.js';
import { User } from '../entities/User.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// ========== REGISTRO E ATIVAÇÃO ==========
interface RegisterAffiliateBody {
  name: string;
  email: string;
  paymentInfo?: string;
}

// Registrar como afiliado
router.post('/register', authenticate, async (req: AuthRequest<{}, {}, RegisterAffiliateBody>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const userRepository = AppDataSource.getRepository(User);

    // Verificar se já é afiliado
    const existingAffiliate = await affiliateRepository.findOne({ where: { userId: req.user.id } });
    if (existingAffiliate) {
      res.status(400).json({ message: 'Você já é um afiliado cadastrado' });
      return;
    }

    // Buscar dados do usuário
    const user = await userRepository.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    // Gerar código único de afiliado
    const affiliateCode = `AFF${user.id.substring(0, 8).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Criar afiliado
    const affiliate = affiliateRepository.create({
      userId: req.user.id,
      affiliateCode,
      name: req.body.name || user.name,
      email: req.body.email || user.email,
      paymentInfo: req.body.paymentInfo,
      status: 'active',
    });

    await affiliateRepository.save(affiliate);

    res.status(201).json({
      message: 'Cadastro de afiliado realizado com sucesso',
      affiliate: {
        id: affiliate.id,
        affiliateCode: affiliate.affiliateCode,
        name: affiliate.name,
        email: affiliate.email,
        commissionRate: affiliate.commissionRate,
        status: affiliate.status,
      },
    });
  } catch (error: any) {
    console.error('Erro ao registrar afiliado:', error);
    res.status(500).json({ message: 'Erro ao registrar afiliado', error: error.message });
  }
});

// Obter informações do afiliado logado
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const affiliate = await affiliateRepository.findOne({ where: { userId: req.user.id } });

    if (!affiliate) {
      res.status(404).json({ message: 'Você não é um afiliado cadastrado' });
      return;
    }

    res.json(affiliate);
  } catch (error: any) {
    console.error('Erro ao buscar afiliado:', error);
    res.status(500).json({ message: 'Erro ao buscar afiliado', error: error.message });
  }
});

// ========== ESTATÍSTICAS E VENDAS ==========
// Obter estatísticas do afiliado
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const affiliateSaleRepository = AppDataSource.getRepository(AffiliateSale);

    const affiliate = await affiliateRepository.findOne({ where: { userId: req.user.id } });
    if (!affiliate) {
      res.status(404).json({ message: 'Você não é um afiliado cadastrado' });
      return;
    }

    // Buscar vendas do mês atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const allSales = await affiliateSaleRepository.find({
      where: {
        affiliateId: affiliate.id,
        status: 'approved',
      },
    });
    
    // Filtrar vendas do mês atual
    const salesThisMonth = allSales.filter(sale => 
      new Date(sale.createdAt) >= startOfMonth
    );

    const monthlyEarnings = salesThisMonth.reduce((sum, sale) => sum + parseFloat(sale.commissionAmount.toString()), 0);

    res.json({
      totalEarnings: parseFloat(affiliate.totalEarnings.toString()),
      pendingEarnings: parseFloat(affiliate.pendingEarnings.toString()),
      paidEarnings: parseFloat(affiliate.paidEarnings.toString()),
      totalSales: affiliate.totalSales,
      totalClicks: affiliate.totalClicks,
      commissionRate: parseFloat(affiliate.commissionRate.toString()),
      monthlyEarnings,
      affiliateCode: affiliate.affiliateCode,
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
});

// Obter vendas do afiliado
router.get('/sales', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const affiliateSaleRepository = AppDataSource.getRepository(AffiliateSale);

    const affiliate = await affiliateRepository.findOne({ where: { userId: req.user.id } });
    if (!affiliate) {
      res.status(404).json({ message: 'Você não é um afiliado cadastrado' });
      return;
    }

    const sales = await affiliateSaleRepository.find({
      where: { affiliateId: affiliate.id },
      relations: ['course', 'student', 'sale'],
      order: { createdAt: 'DESC' },
      take: 50,
    });

    res.json(sales);
  } catch (error: any) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ message: 'Erro ao buscar vendas', error: error.message });
  }
});

// ========== CURSOS DO AFILIADO ==========
// Obter cursos que o afiliado está promovendo (com estatísticas)
router.get('/courses', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const affiliateSaleRepository = AppDataSource.getRepository(AffiliateSale);
    const courseRepository = AppDataSource.getRepository(Course);

    const affiliate = await affiliateRepository.findOne({ where: { userId: req.user.id } });
    if (!affiliate) {
      res.status(404).json({ message: 'Você não é um afiliado cadastrado' });
      return;
    }

    // Buscar todas as vendas do afiliado para obter os cursos únicos
    const affiliateSales = await affiliateSaleRepository.find({
      where: { affiliateId: affiliate.id },
      relations: ['course'],
    });

    // Agrupar por curso e calcular estatísticas
    const courseMap = new Map<string, {
      course: Course;
      totalSales: number;
      totalRevenue: number;
      totalCommissions: number;
      lastSaleDate?: Date;
    }>();

    affiliateSales.forEach((sale) => {
      const courseId = sale.courseId;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          course: sale.course!,
          totalSales: 0,
          totalRevenue: 0,
          totalCommissions: 0,
        });
      }

      const stats = courseMap.get(courseId)!;
      stats.totalSales += 1;
      stats.totalRevenue += parseFloat(sale.saleAmount.toString());
      stats.totalCommissions += parseFloat(sale.commissionAmount.toString());
      
      const saleDate = new Date(sale.createdAt);
      if (!stats.lastSaleDate || saleDate > stats.lastSaleDate) {
        stats.lastSaleDate = saleDate;
      }
    });

    // Converter para array e buscar informações completas dos cursos
    const coursesWithStats = await Promise.all(
      Array.from(courseMap.entries()).map(async ([courseId, stats]) => {
        // Sempre buscar o curso do banco para garantir dados completos
        const course = await courseRepository.findOne({ where: { id: courseId } });
        
        // Se não encontrar o curso, usar o curso da relação (fallback)
        const finalCourse = course || stats.course;
        
        // Se ainda não tiver curso, retornar null para filtrar depois
        if (!finalCourse || !finalCourse.id) {
          console.warn(`Curso não encontrado para ID: ${courseId}`);
          return null;
        }
        
        return {
          course: finalCourse,
          stats: {
            totalSales: stats.totalSales,
            totalRevenue: stats.totalRevenue,
            totalCommissions: stats.totalCommissions,
            lastSaleDate: stats.lastSaleDate,
          },
        };
      })
    );

    // Filtrar cursos inválidos (null)
    const validCourses = coursesWithStats.filter((item) => item !== null && item.course && item.course.id);

    // Ordenar por última venda (mais recente primeiro)
    validCourses.sort((a, b) => {
      if (!a.stats.lastSaleDate && !b.stats.lastSaleDate) return 0;
      if (!a.stats.lastSaleDate) return 1;
      if (!b.stats.lastSaleDate) return -1;
      return b.stats.lastSaleDate.getTime() - a.stats.lastSaleDate.getTime();
    });

    res.json(validCourses);
  } catch (error: any) {
    console.error('Erro ao buscar cursos do afiliado:', error);
    res.status(500).json({ message: 'Erro ao buscar cursos do afiliado', error: error.message });
  }
});

// ========== LINKS DE AFILIAÇÃO ==========
// Gerar link de afiliação para um curso
router.get('/link/:courseId', authenticate, async (req: AuthRequest<{ courseId: string }>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const courseRepository = AppDataSource.getRepository(Course);

    const affiliate = await affiliateRepository.findOne({ where: { userId: req.user.id } });
    if (!affiliate) {
      res.status(404).json({ message: 'Você não é um afiliado cadastrado' });
      return;
    }

    const course = await courseRepository.findOne({ where: { id: req.params.courseId } });
    if (!course) {
      res.status(404).json({ message: 'Curso não encontrado' });
      return;
    }

    // Incrementar contador de cliques
    affiliate.totalClicks += 1;
    await affiliateRepository.save(affiliate);

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const affiliateLink = `${baseUrl}/curso/${req.params.courseId}?ref=${affiliate.affiliateCode}`;

    res.json({
      link: affiliateLink,
      affiliateCode: affiliate.affiliateCode,
      courseTitle: course.title,
      commissionRate: parseFloat(affiliate.commissionRate.toString()),
    });
  } catch (error: any) {
    console.error('Erro ao gerar link:', error);
    res.status(500).json({ message: 'Erro ao gerar link', error: error.message });
  }
});

// ========== ADMIN - GERENCIAR AFILIADOS ==========
// Listar todos os afiliados (apenas admin)
router.get('/admin/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
      return;
    }

    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const affiliates = await affiliateRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    res.json(affiliates);
  } catch (error: any) {
    console.error('Erro ao listar afiliados:', error);
    res.status(500).json({ message: 'Erro ao listar afiliados', error: error.message });
  }
});

// Atualizar status do afiliado (apenas admin)
router.patch('/admin/:id/status', authenticate, async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
      return;
    }

    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      res.status(400).json({ message: 'Status inválido' });
      return;
    }

    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const affiliate = await affiliateRepository.findOne({ where: { id: req.params.id } });

    if (!affiliate) {
      res.status(404).json({ message: 'Afiliado não encontrado' });
      return;
    }

    affiliate.status = status;
    await affiliateRepository.save(affiliate);

    res.json(affiliate);
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ message: 'Erro ao atualizar status', error: error.message });
  }
});

// Atualizar taxa de comissão (apenas admin)
router.patch('/admin/:id/commission', authenticate, async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
      return;
    }

    const { commissionRate } = req.body;
    if (commissionRate < 0 || commissionRate > 100) {
      res.status(400).json({ message: 'Taxa de comissão deve estar entre 0 e 100' });
      return;
    }

    const affiliateRepository = AppDataSource.getRepository(Affiliate);
    const affiliate = await affiliateRepository.findOne({ where: { id: req.params.id } });

    if (!affiliate) {
      res.status(404).json({ message: 'Afiliado não encontrado' });
      return;
    }

    affiliate.commissionRate = commissionRate;
    await affiliateRepository.save(affiliate);

    res.json(affiliate);
  } catch (error: any) {
    console.error('Erro ao atualizar comissão:', error);
    res.status(500).json({ message: 'Erro ao atualizar comissão', error: error.message });
  }
});

export default router;

