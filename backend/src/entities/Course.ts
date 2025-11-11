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

  @ManyToMany(() => User, user => user.enrolledCourses)
  enrolledUsers?: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

