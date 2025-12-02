import { Product } from '../entities/product.entity';
import { Category } from '../../categories/entities/category.entity';

export class ProductResponseDto {
  id!: number;
  name!: string;
  description!: string;
  price!: number;
  stock!: number;
  attributes?: Record<string, any> | null;
  category?: Pick<Category, 'id' | 'name'> | null;
  createdAt!: Date;

  static fromEntity(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.price = Number(product.price);
    dto.stock = product.stock;
    dto.attributes = product.attributes ?? null;
    dto.category = product.category
      ? { id: product.category.id, name: product.category.name }
      : null;
    dto.createdAt = product.createdAt;
    return dto;
  }
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  priceRange?: {
    min: number;
    max: number;
  } | null;
}

export interface PaginatedProductsResponse {
  data: ProductResponseDto[];
  meta: PaginationMeta;
}
