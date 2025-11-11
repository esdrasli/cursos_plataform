import { Column } from 'typeorm';

export class Lesson {
  @Column({ type: 'varchar', length: 255 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 50 })
  duration!: string;

  @Column({ type: 'text' })
  videoUrl!: string;

  @Column({ type: 'boolean', default: false })
  completed!: boolean;

  @Column({ type: 'boolean', default: false })
  locked!: boolean;
}

