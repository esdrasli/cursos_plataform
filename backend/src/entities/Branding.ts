import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './User.js';

@Entity('brandings')
@Index(['creatorId'], { unique: true })
export class Branding {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  creatorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator?: User;

  // Logo
  @Column({ type: 'varchar', length: 500, nullable: true })
  logo?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoDark?: string; // Logo para modo escuro

  @Column({ type: 'varchar', length: 100, default: 'left' })
  logoPosition!: 'left' | 'center' | 'right';

  // Cores
  @Column({ type: 'jsonb', nullable: true })
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

  // Tipografia
  @Column({ type: 'varchar', length: 100, nullable: true })
  fontFamily?: string; // Ex: 'Inter', 'Roboto', 'Poppins', etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  headingFont?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bodyFont?: string;

  @Column({ type: 'jsonb', nullable: true })
  typography?: {
    h1?: { size?: string; weight?: string; lineHeight?: string };
    h2?: { size?: string; weight?: string; lineHeight?: string };
    h3?: { size?: string; weight?: string; lineHeight?: string };
    body?: { size?: string; weight?: string; lineHeight?: string };
  };

  // Estilos da seção de cursos
  @Column({ type: 'jsonb', nullable: true })
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

  // Estilos gerais
  @Column({ type: 'jsonb', nullable: true })
  styles?: {
    borderRadius?: string;
    buttonStyle?: 'rounded' | 'square' | 'pill';
    buttonSize?: 'sm' | 'md' | 'lg';
    spacing?: 'compact' | 'comfortable' | 'spacious';
    animation?: boolean;
  };

  // Favicon
  @Column({ type: 'varchar', length: 500, nullable: true })
  favicon?: string;

  // Meta tags personalizadas
  @Column({ type: 'jsonb', nullable: true })
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

