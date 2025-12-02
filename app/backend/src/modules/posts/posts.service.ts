import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import {
  PaginatedPostsResponse,
  PostResponseDto,
} from './dto/post-response.dto';
import { PostStatus } from './entities/post-status.enum';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async listPublic(dto: ListPostsDto): Promise<PaginatedPostsResponse> {
    return this.listPosts(dto, false);
  }

  async listManaged(dto: ListPostsDto): Promise<PaginatedPostsResponse> {
    return this.listPosts(dto, true);
  }

  private async listPosts(
    dto: ListPostsDto,
    includeAllStatuses: boolean,
  ): Promise<PaginatedPostsResponse> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.postsRepo.createQueryBuilder('post');

    if (!includeAllStatuses) {
      qb.andWhere('post.status = :published', {
        published: PostStatus.PUBLISHED,
      });
    } else if (dto.status) {
      qb.andWhere('post.status = :statusFilter', { statusFilter: dto.status });
    }

    if (dto.search) {
      const search = `%${dto.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(post.title) LIKE :search OR LOWER(post.content) LIKE :search)',
        { search },
      );
    }

    if (dto.categoryId) {
      qb.andWhere('post.categoryId = :categoryId', {
        categoryId: dto.categoryId,
      });
    }

    qb.orderBy('post.publishAt', 'DESC').addOrderBy('post.createdAt', 'DESC');

    const [records, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: records.map(PostResponseDto.fromEntity),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getPublishedPostBySlug(
    slug: string,
    userId?: number,
  ): Promise<PostResponseDto> {
    const post = await this.postsRepo.findOne({
      where: { slug, status: PostStatus.PUBLISHED },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return PostResponseDto.fromEntity(post);
  }

  async create(dto: CreatePostDto, authorId: number): Promise<PostResponseDto> {
    await this.ensureCategoryExists(dto.categoryId);

    const status = dto.status ?? PostStatus.DRAFT;
    const publishAt = this.resolvePublishAt(status, dto.publishAt);
    const slug = await this.generateUniqueSlug(dto.title);

    const entity = this.postsRepo.create({
      title: dto.title,
      content: dto.content,
      excerpt: dto.excerpt ?? null,
      coverImage: dto.coverImage ?? null,
      status,
      publishAt,
      slug,
      categoryId: dto.categoryId ?? null,
      authorId,
    });

    const saved = await this.postsRepo.save(entity);
    return PostResponseDto.fromEntity(saved);
  }

  async update(
    id: number,
    dto: UpdatePostDto,
    currentUserId: number,
  ): Promise<PostResponseDto> {
    const post = await this.requireAuthorAccess(id, currentUserId);

    if (dto.title && dto.title !== post.title) {
      post.title = dto.title;
      post.slug = await this.generateUniqueSlug(dto.title, post.id);
    }

    if (dto.content !== undefined) {
      post.content = dto.content;
    }

    if (dto.excerpt !== undefined) {
      post.excerpt = dto.excerpt;
    }

    if (dto.coverImage !== undefined) {
      post.coverImage = dto.coverImage;
    }

    if (dto.categoryId !== undefined) {
      await this.ensureCategoryExists(dto.categoryId);
      post.categoryId = dto.categoryId;
    }

    if (dto.status) {
      post.status = dto.status;
    }

    if (dto.publishAt !== undefined) {
      post.publishAt = dto.publishAt ? new Date(dto.publishAt) : null;
    }

    const saved = await this.postsRepo.save(post);
    return PostResponseDto.fromEntity(saved);
  }

  async publish(id: number, currentUserId: number): Promise<PostResponseDto> {
    const post = await this.requireAuthorAccess(id, currentUserId);
    post.status = PostStatus.PUBLISHED;
    post.publishAt = new Date();
    const saved = await this.postsRepo.save(post);
    return PostResponseDto.fromEntity(saved);
  }

  async unpublish(id: number, currentUserId: number): Promise<PostResponseDto> {
    const post = await this.requireAuthorAccess(id, currentUserId);
    post.status = PostStatus.DRAFT;
    const saved = await this.postsRepo.save(post);
    return PostResponseDto.fromEntity(saved);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    const post = await this.requireAuthorAccess(id, currentUserId);
    await this.postsRepo.remove(post);
  }

  private async requireAuthorAccess(
    id: number,
    currentUserId: number,
  ): Promise<Post> {
    const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to modify this post',
      );
    }

    return post;
  }

  private async ensureCategoryExists(categoryId?: number) {
    if (!categoryId) {
      return;
    }

    const exists = await this.categoriesRepo.findOne({
      where: { id: categoryId },
    });
    if (!exists) {
      throw new NotFoundException('Category not found');
    }
  }

  private resolvePublishAt(
    status: PostStatus,
    publishAt?: string,
  ): Date | null {
    if (status === PostStatus.PUBLISHED) {
      return publishAt ? new Date(publishAt) : new Date();
    }

    return publishAt ? new Date(publishAt) : null;
  }

  private async generateUniqueSlug(
    title: string,
    existingId?: number,
  ): Promise<string> {
    const base = this.slugify(title);
    let slug = base;
    let counter = 1;

    while (true) {
      const existing = await this.postsRepo.findOne({ where: { slug } });
      if (!existing || (existingId && existing.id === existingId)) {
        return slug;
      }

      slug = `${base}-${counter++}`;
    }
  }

  private slugify(input: string): string {
    return (
      input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .replace(/--+/g, '-') || 'post'
    );
  }
}
