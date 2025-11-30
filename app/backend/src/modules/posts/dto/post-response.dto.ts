import { Post } from '../entities/post.entity';
import { PostStatus } from '../entities/post-status.enum';

export class PostResponseDto {
  id!: number;
  title!: string;
  slug!: string;
  content!: string;
  excerpt?: string | null;
  coverImage?: string | null;
  status!: PostStatus;
  publishAt?: Date | null;
  categoryId?: number | null;
  authorId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(post: Post): PostResponseDto {
    const dto = new PostResponseDto();
    dto.id = post.id;
    dto.title = post.title;
    dto.slug = post.slug;
    dto.content = post.content;
    dto.excerpt = post.excerpt ?? null;
    dto.coverImage = post.coverImage ?? null;
    dto.status = post.status;
    dto.publishAt = post.publishAt ?? null;
    dto.categoryId = post.categoryId ?? null;
    dto.authorId = post.authorId;
    dto.createdAt = post.createdAt;
    dto.updatedAt = post.updatedAt;
    return dto;
  }
}

export interface PaginatedPostsResponse {
  data: PostResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
