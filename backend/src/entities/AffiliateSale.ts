import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Affiliate } from './Affiliate.js';
import { Sale } from './Sale.js';
import { Course } from './Course.js';
import { User } from './User.js';

@Entity('affiliate_sales')
@Index(['affiliateId'])
@Index(['saleId'], { unique: true })
@Index(['courseId'])
export class AffiliateSale {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  affiliateId!: string;

  @ManyToOne(() => Affiliate)
  @JoinColumn({ name: 'affiliateId' })
  affiliate?: Affiliate;

  @Column({ type: 'uuid', unique: true })
  saleId!: string;

  @ManyToOne(() => Sale)
  @JoinColumn({ name: 'saleId' })
  sale?: Sale;

  @Column({ type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course?: Course;

  @Column({ type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student?: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  saleAmount!: number; // Valor total da venda

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commissionRate!: number; // Taxa de comissão aplicada

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commissionAmount!: number; // Valor da comissão em R$

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending'
  })
  status!: 'pending' | 'approved' | 'paid' | 'cancelled';

  @CreateDateColumn()
  createdAt!: Date;
}

