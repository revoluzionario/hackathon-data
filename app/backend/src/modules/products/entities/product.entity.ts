import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column('numeric')
  price!: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ type: 'jsonb' })
  attributes!: {
    color?: string;
    size?: string;
    material?: string;
  };

  @Column()
  stock!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
