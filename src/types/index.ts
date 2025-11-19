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

export interface CreateCourseInput {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  category: string;
  level?: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  modules?: Module[];
  features?: string[];
  status?: 'draft' | 'published';
  sections?: Array<{
    id: string;
    type: 'banner' | 'modules' | 'features' | 'instructor' | 'testimonials' | 'cta' | 'text' | 'video';
    order: number;
    data: unknown;
    visible?: boolean;
  }>;
  platformConfig?: Course['platformConfig'];
  customization?: unknown;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {
  id?: never; // Não permitir atualizar o ID
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
  sections?: unknown[];
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

export interface CreateLandingPageInput {
  title: string;
  courseId: string;
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    image: string;
  };
  status?: 'Publicada' | 'Rascunho';
  sections?: unknown[];
  layout?: LandingPage['layout'];
}

export interface UpdateLandingPageInput extends Partial<CreateLandingPageInput> {
  id?: never; // Não permitir atualizar o ID
}

export type ConfigValue = string | number | boolean | Record<string, unknown> | unknown[];

export type ConfigType = 'string' | 'number' | 'boolean' | 'json';

export interface SetConfigInput {
  key: string;
  value: ConfigValue;
  type?: ConfigType;
  description?: string;
  category?: string;
}

export interface PaymentData {
  number?: string;
  expiry?: string;
  cvv?: string;
  name?: string;
  installments?: number;
  document?: string;
}

export interface ProcessPaymentRequest {
  courseId: string;
  paymentMethod: 'credit' | 'pix' | 'boleto';
  paymentData?: PaymentData;
  affiliateCode?: string;
}

export interface BrandingData {
  logo?: string;
  logoDark?: string;
  logoPosition?: 'left' | 'center' | 'right';
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    textSecondary?: string;
    border?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  fontFamily?: string;
  headingFont?: string;
  bodyFont?: string;
  typography?: {
    h1?: { size?: string; weight?: string; lineHeight?: string };
    h2?: { size?: string; weight?: string; lineHeight?: string };
    h3?: { size?: string; weight?: string; lineHeight?: string };
    body?: { size?: string; weight?: string; lineHeight?: string };
  };
  coursesSection?: {
    layout?: 'grid' | 'list' | 'carousel';
    cardStyle?: 'default' | 'minimal' | 'elevated' | 'bordered';
    showInstructor?: boolean;
    showRating?: boolean;
    showPrice?: boolean;
    showCategory?: boolean;
    cardBorderRadius?: string;
    cardShadow?: string;
  };
  styles?: {
    borderRadius?: string;
    buttonStyle?: 'rounded' | 'square' | 'pill';
    buttonSize?: 'sm' | 'md' | 'lg';
    spacing?: 'compact' | 'comfortable' | 'spacious';
    animation?: boolean;
  };
  favicon?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
}

export interface UpdateBrandingInput extends Partial<BrandingData> {
  id?: never; // Não permitir atualizar o ID
}
