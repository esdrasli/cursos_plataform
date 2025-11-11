import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'creator' | 'admin';
}

interface LoginBody {
  email: string;
  password: string;
}

// Registrar novo usuário
router.post('/register', async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    // Verificar se o usuário já existe
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email já está em uso' });
      return;
    }

    // Criar novo usuário
    const user = userRepository.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    await userRepository.save(user);

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
});

// Login
router.post('/login', async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email e senha são obrigatórios' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    // Buscar usuário
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Email ou senha incorretos' });
      return;
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Email ou senha incorretos' });
      return;
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

// Obter perfil do usuário logado
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.user.id },
      relations: ['enrolledCourses']
    });

    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      enrolledCourses: user.enrolledCourses
    });
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil', error: error.message });
  }
});

export default router;
