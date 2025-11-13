import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  Index
} from 'typeorm';
import { User } from './User.js';
import { ModuleEntity } from './Module.js';

@Entity('courses')
@Index(['instructorId'])
@Index(['category'])
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 500 })
  thumbnail!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice?: number;

  @Column({ type: 'varchar', length: 255 })
  instructor!: string;

  @Column({ type: 'uuid' })
  instructorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructorId' })
  instructorUser?: User;

  @Column({ type: 'varchar', length: 500, default: 'https://i.pravatar.cc/150?img=1' })
  instructorAvatar!: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ type: 'int', default: 0 })
  totalStudents!: number;

  @Column({ type: 'varchar', length: 100 })
  duration!: string;

  @Column({
    type: 'enum',
    enum: ['Iniciante', 'Intermediário', 'Avançado']
  })
  level!: 'Iniciante' | 'Intermediário' | 'Avançado';

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'jsonb', default: [] })
  modules!: ModuleEntity[];

  @Column({ type: 'text', array: true, default: [] })
  features!: string[];

  @Column({
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft'
  })
  status!: 'draft' | 'published';

  // Seções da página do curso (page builder)
  @Column({ type: 'jsonb', nullable: true })
  sections?: Array<{
    id: string;
    type: 'banner' | 'modules' | 'features' | 'instructor' | 'testimonials' | 'cta' | 'text' | 'video';
    order: number;
    data: any; // Dados específicos de cada seção
    visible?: boolean;
  }>;

  // Configurações da plataforma de aprendizado
  @Column({ type: 'jsonb', nullable: true })
  platformConfig?: {
    headerBanner?: {
      image?: string;
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

  // Personalização visual do curso (como Kiwify)
  @Column({ type: 'jsonb', nullable: true })
  customization?: {
    // Cores
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      text?: string;
      textSecondary?: string;
      button?: string;
      buttonText?: string;
      header?: string;
      headerText?: string;
    };
    // Tipografia
    typography?: {
      fontFamily?: string;
      headingFont?: string;
      bodyFont?: string;
      headingSize?: string;
      bodySize?: string;
    };
    // Layout
    layout?: {
      headerStyle?: 'default' | 'minimal' | 'centered';
      buttonStyle?: 'rounded' | 'square' | 'pill';
      cardStyle?: 'default' | 'minimal' | 'elevated';
      sidebarStyle?: 'default' | 'minimal';
    };
    // Background
    background?: {
      type?: 'color' | 'gradient' | 'image';
      value?: string; // cor, gradiente ou URL da imagem
      overlay?: boolean;
    };
    // Elementos visuais
    elements?: {
      showProgressBar?: boolean;
      showModuleNumbers?: boolean;
      showLessonDuration?: boolean;
      showInstructorInfo?: boolean;
      customLogo?: string;
    };
  };

  @ManyToMany(() => User, user => user.enrolledCourses)
  enrolledUsers?: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

