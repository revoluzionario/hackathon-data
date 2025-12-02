import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ListProductsDto, ProductSortOption } from './dto/list-products.dto';
import {
  PaginatedProductsResponse,
  ProductResponseDto,
} from './dto/product-response.dto';

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

  findOne(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.repo.findOne({
      where: { id },
      relations: ['category'],
    });
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

  async list(dto: ListProductsDto): Promise<PaginatedProductsResponse> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 12;

    const qb = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (dto.search) {
      const searchTerm = `%${dto.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)',
        {
          search: searchTerm,
        },
      );
    }

    if (dto.categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId: dto.categoryId });
    }

    if (dto.colors?.length) {
      qb.andWhere("(product.attributes->>'color') IN (:...colors)", {
        colors: dto.colors,
      });
    }

    if (dto.sizes?.length) {
      qb.andWhere("(product.attributes->>'size') IN (:...sizes)", {
        sizes: dto.sizes,
      });
    }

    if (dto.materials?.length) {
      qb.andWhere("(product.attributes->>'material') IN (:...materials)", {
        materials: dto.materials,
      });
    }

    if (dto.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: dto.minPrice });
    }

    if (dto.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: dto.maxPrice });
    }

    const aggregateQb = qb.clone();
    const { min: minPriceRaw, max: maxPriceRaw } =
      (await aggregateQb
      .select('MIN(product.price)', 'min')
      .addSelect('MAX(product.price)', 'max')
        .getRawOne<{ min: string | null; max: string | null }>()) ?? {
        min: null,
        max: null,
      };

    switch (dto.sort) {
      case ProductSortOption.PRICE_ASC:
        qb.orderBy('product.price', 'ASC');
        break;
      case ProductSortOption.PRICE_DESC:
        qb.orderBy('product.price', 'DESC');
        break;
      case ProductSortOption.POPULARITY:
        qb.orderBy('product.stock', 'DESC');
        break;
      case ProductSortOption.RATING:
        qb.orderBy('product.createdAt', 'DESC');
        break;
      default:
        qb.orderBy('product.createdAt', 'DESC');
        break;
    }

    const [records, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const priceRange = total
      ? {
          min: Number(minPriceRaw ?? 0),
          max: Number(maxPriceRaw ?? 0),
        }
      : null;

    return {
      data: records.map(ProductResponseDto.fromEntity),
      meta: {
        page,
        limit,
        total,
        totalPages,
        priceRange,
      },
    };
  }
}
