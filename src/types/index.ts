export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  instructor: string;
  instructorAvatar: string;
  rating: number;
  totalStudents: number;
  duration: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  category: string;
  modules: Module[];
  features: string[];
}

export interface Module {
  id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
  completed?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed?: boolean;
  locked?: boolean;
}

export interface User {
  id:string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourses: string[];
}

export interface Sale {
  id: string;
  courseTitle: string;
  studentName: string;
  date: string;
  amount: number;
}

export interface CreatorStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledDate: string;
  totalSpent: number;
}

export interface LandingPage {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  lastUpdated: string;
  status: 'Publicada' | 'Rascunho';
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    image: string;
  };
}
