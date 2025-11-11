import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
import { AuthRequest, IUser } from '../types/index.js';

// Re-export AuthRequest for convenience
export type { AuthRequest } from '../types/index.js';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JwtPayload;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    if (!user) {
      res.status(401).json({ message: 'Usuário não encontrado' });
      return;
    }

    req.user = user as IUser;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

export const requireCreator = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role !== 'creator' && req.user.role !== 'admin') {
    res.status(403).json({ message: 'Acesso negado. Apenas criadores podem acessar esta rota.' });
    return;
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role !== 'admin') {
    res.status(403).json({ message: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
    return;
  }
  next();
};
