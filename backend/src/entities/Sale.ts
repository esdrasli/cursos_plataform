import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './User.js';
import { Course } from './Course.js';

@Entity('sales')
@Index(['studentId'])
@Index(['instructorId'])
@Index(['courseId'])
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course?: Course;

  @Column({ type: 'varchar', length: 255 })
  courseTitle!: string;

  @Column({ type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student?: User;

  @Column({ type: 'varchar', length: 255 })
  studentName!: string;

  @Column({ type: 'uuid' })
  instructorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructorId' })
  instructor?: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: ['credit', 'pix', 'boleto']
  })
  paymentMethod!: 'credit' | 'pix' | 'boleto';

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  })
  status!: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  affiliateCode?: string; // Código do afiliado que gerou a venda

  @CreateDateColumn()
  createdAt!: Date;
}

