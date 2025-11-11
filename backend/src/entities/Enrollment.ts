import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { User } from './User.js';

interface CompletedLesson {
  moduleId: string;
  lessonId: string;
  completedAt: Date;
}

@Entity('enrollments')
@Unique(['userId', 'courseId'])
@Index(['userId'])
@Index(['courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'uuid' })
  courseId!: string;

  @ManyToOne('Course')
  @JoinColumn({ name: 'courseId' })
  course?: any;

  @Column({ type: 'int', default: 0 })
  progress!: number;

  @Column({ type: 'jsonb', default: [] })
  completedLessons!: CompletedLesson[];

  @CreateDateColumn()
  enrolledAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastAccessedAt!: Date;
}

