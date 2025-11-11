// User Types
export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: 'student' | 'creator' | 'admin';
  enrolledCourses?: any[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Lesson Types
export interface ILesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed?: boolean;
  locked?: boolean;
}

// Module Types
export interface IModule {
  id: string;
  title: string;
  duration: string;
  lessons: ILesson[];
  completed?: boolean;
}

// Course Types
export interface ICourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  instructor: string;
  instructorId: string;
  instructorAvatar: string;
  rating: number;
  totalStudents: number;
  duration: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  category: string;
  modules: IModule[];
  features: string[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment Types
export interface ICompletedLesson {
  moduleId: string;
  lessonId: string;
  completedAt: Date;
}

export interface IEnrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: ICompletedLesson[];
  enrolledAt: Date;
  lastAccessedAt: Date;
}

// Sale Types
export interface ISale {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  instructorId: string;
  amount: number;
  paymentMethod: 'credit' | 'pix' | 'boleto';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Date;
}

// Landing Page Types
export interface IHero {
  title: string;
  subtitle: string;
  cta: string;
  image: string;
}

export interface ILandingPage {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  creatorId: string;
  hero: IHero;
  status: 'Publicada' | 'Rascunho';
  lastUpdated: Date;
  createdAt: Date;
}

// Request Types
import { Request } from 'express';

export interface AuthRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: IUser;
}

// Re-export for convenience
export type { Request, Response, NextFunction } from 'express';

// Response Types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

