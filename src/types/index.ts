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
  status?: 'draft' | 'published';
  customization?: any;
  sections?: Array<{
    id: string;
    type: 'banner' | 'modules' | 'features' | 'instructor' | 'testimonials' | 'cta' | 'text' | 'video';
    order: number;
    data: any;
    visible?: boolean;
  }>;
  platformConfig?: {
    headerBanner?: {
      image?: string | {
        url: string;
        scale?: number;
        position?: { x: number; y: number };
        crop?: { x: number; y: number; width: number; height: number };
        rotation?: number;
      };
      title?: string;
      subtitle?: string;
      show?: boolean;
    };
    logo?: string;
    logoDark?: string;
    background?: {
      type?: 'color' | 'image' | 'gradient';
      color?: string;
      image?: string;
      gradient?: string;
    };
    theme?: 'light' | 'dark';
    memberAreaName?: string;
    customDomain?: string;
    sidebar?: {
      logo?: string;
      backgroundColor?: string;
      textColor?: string;
      menuItems?: Array<{
        id: string;
        label: string;
        icon?: string;
        url?: string;
        visible?: boolean;
      }>;
    };
    shareImage?: string;
    coverImage?: string;
  };
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
  lastUpdated?: string;
  createdAt?: string;
  status: 'Publicada' | 'Rascunho';
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    image: string;
  };
  sections?: any[];
  layout?: {
    heroLayout?: 'centered' | 'split' | 'minimal';
    heroBackground?: 'gradient' | 'solid' | 'image';
    colorScheme?: 'primary' | 'bold' | 'elegant' | 'vibrant';
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography?: 'bold' | 'elegant' | 'modern';
    spacing?: 'compact' | 'comfortable' | 'spacious';
    ctaStyle?: 'small' | 'medium' | 'large';
    ctaPosition?: 'left' | 'center' | 'right';
  };
}
