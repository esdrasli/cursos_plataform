import { Column } from 'typeorm';
import { Lesson } from './Lesson.js';

export class ModuleEntity {
  @Column({ type: 'varchar', length: 255 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 50 })
  duration!: string;

  @Column({ type: 'jsonb', default: [] })
  lessons!: Lesson[];

  @Column({ type: 'boolean', default: false })
  completed!: boolean;
}

