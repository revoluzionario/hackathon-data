import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ListPostsDto } from './dto/list-posts.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  async listPublished(@Query() query: ListPostsDto) {
    return this.postsService.listPublic(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async listManaged(@Query() query: ListPostsDto) {
    return this.postsService.listManaged(query);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Public()
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string, @CurrentUser() user: User | null) {
    return this.postsService.getPublishedPostBySlug(slug, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  async publish(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.postsService.publish(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unpublish')
  async unpublish(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.postsService.unpublish(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.postsService.remove(id, user.id);
    return { success: true };
  }
}
