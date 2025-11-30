import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { AnalyticsEventType } from '../analytics/constants/event-types';
import { AnalyticsService } from '../analytics/analytics.service';
import { User } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Public()
  @Get('search')
  search(@Query() query: Record<string, any>) {
    return this.productsService.search(query);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: number, @CurrentUser() user: User | null) {
    const productId = +id;
    const product = await this.productsService.findOne(productId);
    if (product) {
      await this.analyticsService.captureEvent({
        userId: user?.id ?? 0,
        eventType: AnalyticsEventType.VIEW_PRODUCT,
        metadata: { productId },
      });
    }
    return product;
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productsService.remove(+id);
  }
}
