import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateProductDto) {
    const category = await this.categoriesService.findOne(dto.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.repo.create({
      ...dto,
      category,
    });

    return this.repo.save(product);
  }

  findAll() {
    return this.repo.find({
      relations: ['category'],
    });
  }

  findOne(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!product) {
      throw new NotFoundException();
    }

    if (dto.categoryId) {
      const category = await this.categoriesService.findOne(dto.categoryId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      product.category = category;
    }

    Object.assign(product, dto);
    return this.repo.save(product);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  async search(query: Record<string, any>) {
    const qb = this.repo.createQueryBuilder('p').leftJoinAndSelect('p.category', 'c');

    if (query.name) {
      qb.andWhere('p.name ILIKE :name', { name: `%${query.name}%` });
    }

    if (query.categoryId) {
      qb.andWhere('c.id = :categoryId', { categoryId: query.categoryId });
    }

    if (query.color) {
      qb.andWhere("p.attributes->>'color' = :color", { color: query.color });
    }

    if (query.size) {
      qb.andWhere("p.attributes->>'size' = :size", { size: query.size });
    }

    if (query.material) {
      qb.andWhere("p.attributes->>'material' = :material", { material: query.material });
    }

    if (query.minPrice) {
      qb.andWhere('p.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice) {
      qb.andWhere('p.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    return qb.getMany();
  }
}
