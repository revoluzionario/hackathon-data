import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  price!: number;

  @IsNumber()
  categoryId!: number;

  @IsOptional()
  attributes?: {
    color?: string;
    size?: string;
    material?: string;
  };

  @IsNumber()
  stock!: number;
}
