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

@Entity('affiliates')
@Index(['userId'], { unique: true })
@Index(['affiliateCode'], { unique: true })
export class Affiliate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'varchar', length: 50, unique: true })
  affiliateCode!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  commissionRate!: number; // Porcentagem de comissão (padrão 10%)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings!: number; // Total ganho em R$

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingEarnings!: number; // Ganhos pendentes de pagamento

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidEarnings!: number; // Ganhos já pagos

  @Column({ type: 'int', default: 0 })
  totalSales!: number; // Total de vendas geradas

  @Column({ type: 'int', default: 0 })
  totalClicks!: number; // Total de cliques nos links

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  })
  status!: 'active' | 'inactive' | 'suspended';

  @Column({ type: 'text', nullable: true })
  paymentInfo?: string; // Informações de pagamento (PIX, conta bancária, etc.)

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

