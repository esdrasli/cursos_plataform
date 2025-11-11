import express from 'express';
import Sale from '../models/Sale.js';
import Enrollment from '../models/Enrollment.js';
import LandingPage from '../models/LandingPage.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { authenticate, requireCreator } from '../middleware/auth.middleware.js';

const router = express.Router();

// Aplicar middleware de autenticação e permissão de criador em todas as rotas
router.use(authenticate);
router.use(requireCreator);

// ========== DASHBOARD ==========
router.get('/dashboard/stats', async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.user._id });
    const courseIds = courses.map(c => c._id);
    
    // Vendas do mês atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const salesThisMonth = await Sale.find({
      instructorId: req.user._id,
      status: 'completed',
      createdAt: { $gte: startOfMonth }
    });
    
    const totalRevenue = salesThisMonth.reduce((sum, sale) => sum + sale.amount, 0);
    const totalSales = salesThisMonth.length;
    
    // Novos alunos do mês
    const enrollmentsThisMonth = await Enrollment.find({
      courseId: { $in: courseIds },
      enrolledAt: { $gte: startOfMonth }
    });
    
    const newStudents = enrollmentsThisMonth.length;
    
    res.json({
      totalRevenue,
      totalSales,
      newStudents,
      totalCourses: courses.length
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
});

// ========== VENDAS ==========
router.get('/sales', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = { instructorId: req.user._id };
    
    if (search) {
      query.$or = [
        { courseTitle: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sales = await Sale.find(query)
      .populate('studentId', 'name email avatar')
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Sale.countDocuments(query);
    
    res.json({
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ message: 'Erro ao buscar vendas', error: error.message });
  }
});

// ========== ALUNOS ==========
router.get('/students', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const courses = await Course.find({ instructorId: req.user._id });
    const courseIds = courses.map(c => c._id);
    
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('userId', 'name email avatar')
      .populate('courseId', 'title');
    
    // Agrupar por aluno e calcular total gasto
    const studentMap = new Map();
    
    enrollments.forEach(enrollment => {
      const userId = enrollment.userId._id.toString();
      const student = enrollment.userId;
      
      if (!studentMap.has(userId)) {
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
      
      const studentData = studentMap.get(userId);
      studentData.courses.push(enrollment.courseId.title);
    });
    
    // Buscar vendas para calcular total gasto
    const sales = await Sale.find({
      studentId: { $in: Array.from(studentMap.keys()) },
      courseId: { $in: courseIds },
      status: 'completed'
    });
    
    sales.forEach(sale => {
      const studentId = sale.studentId.toString();
      if (studentMap.has(studentId)) {
        studentMap.get(studentId).totalSpent += sale.amount;
      }
    });
    
    let students = Array.from(studentMap.values());
    
    // Filtrar por busca
    if (search) {
      students = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Ordenar por data de inscrição
    students.sort((a, b) => new Date(b.enrolledDate) - new Date(a.enrolledDate));
    
    const total = students.length;
    students = students.slice(skip, skip + parseInt(limit));
    
    res.json({
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ message: 'Erro ao buscar alunos', error: error.message });
  }
});

// ========== LANDING PAGES ==========
router.get('/landing-pages', async (req, res) => {
  try {
    const landingPages = await LandingPage.find({ creatorId: req.user._id })
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    
    res.json(landingPages);
  } catch (error) {
    console.error('Erro ao buscar landing pages:', error);
    res.status(500).json({ message: 'Erro ao buscar landing pages', error: error.message });
  }
});

router.get('/landing-pages/:id', async (req, res) => {
  try {
    const landingPage = await LandingPage.findOne({
      _id: req.params.id,
      creatorId: req.user._id
    }).populate('courseId');
    
    if (!landingPage) {
      return res.status(404).json({ message: 'Landing page não encontrada' });
    }
    
    res.json(landingPage);
  } catch (error) {
    console.error('Erro ao buscar landing page:', error);
    res.status(500).json({ message: 'Erro ao buscar landing page', error: error.message });
  }
});

router.post('/landing-pages', async (req, res) => {
  try {
    const { title, courseId, hero, status } = req.body;
    
    const course = await Course.findOne({
      _id: courseId,
      instructorId: req.user._id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado ou você não tem permissão' });
    }
    
    const landingPage = new LandingPage({
      title,
      courseId: course._id,
      courseTitle: course.title,
      creatorId: req.user._id,
      hero,
      status: status || 'Rascunho'
    });
    
    await landingPage.save();
    
    res.status(201).json(landingPage);
  } catch (error) {
    console.error('Erro ao criar landing page:', error);
    res.status(500).json({ message: 'Erro ao criar landing page', error: error.message });
  }
});

router.put('/landing-pages/:id', async (req, res) => {
  try {
    const landingPage = await LandingPage.findOne({
      _id: req.params.id,
      creatorId: req.user._id
    });
    
    if (!landingPage) {
      return res.status(404).json({ message: 'Landing page não encontrada' });
    }
    
    Object.assign(landingPage, req.body);
    await landingPage.save();
    
    res.json(landingPage);
  } catch (error) {
    console.error('Erro ao atualizar landing page:', error);
    res.status(500).json({ message: 'Erro ao atualizar landing page', error: error.message });
  }
});

router.delete('/landing-pages/:id', async (req, res) => {
  try {
    const landingPage = await LandingPage.findOne({
      _id: req.params.id,
      creatorId: req.user._id
    });
    
    if (!landingPage) {
      return res.status(404).json({ message: 'Landing page não encontrada' });
    }
    
    await LandingPage.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Landing page deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar landing page:', error);
    res.status(500).json({ message: 'Erro ao deletar landing page', error: error.message });
  }
});

export default router;

