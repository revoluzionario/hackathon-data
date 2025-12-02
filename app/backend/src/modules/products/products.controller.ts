import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Public()
  @Get()
  list(@Query(new ValidationPipe({ transform: true })) query: ListProductsDto) {
    return this.productsService.list(query);
  }

  @Public()
  @Get('search')
  search(@Query(new ValidationPipe({ transform: true })) query: ListProductsDto) {
    return this.productsService.list(query);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: number, @CurrentUser() user: User | null) {
    const productId = +id;
    return this.productsService.findOne(productId);
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
