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
import { Course } from './Course.js';

interface Hero {
  title: string;
  subtitle: string;
  cta: string;
  image: string;
}

@Entity('landing_pages')
@Index(['courseId'])
@Index(['creatorId'])
export class LandingPage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course?: Course;

  @Column({ type: 'varchar', length: 255 })
  courseTitle!: string;

  @Column({ type: 'uuid' })
  creatorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator?: User;

  @Column({ type: 'jsonb' })
  hero!: Hero;

  @Column({ type: 'jsonb', nullable: true })
  sections?: any[];

  @Column({ type: 'jsonb', nullable: true })
  layout?: any;

  @Column({
    type: 'enum',
    enum: ['Publicada', 'Rascunho'],
    default: 'Rascunho'
  })
  status!: 'Publicada' | 'Rascunho';

  @UpdateDateColumn()
  lastUpdated!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}

