import { IsNumber } from 'class-validator';

export class UpdateCartItemDto {
  @IsNumber()
  productId!: number;

  @IsNumber()
  quantity!: number;
}
