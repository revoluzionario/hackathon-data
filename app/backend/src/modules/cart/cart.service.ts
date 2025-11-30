import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsEventType } from '../analytics/constants/event-types';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private itemsRepo: Repository<CartItem>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async getOrCreateCart(userId: number) {
    let cart = await this.cartsRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.product'],
    });

    if (!cart) {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      cart = this.cartsRepo.create({ user, items: [] });
      await this.cartsRepo.save(cart);
    }

    return cart;
  }

  async getCart(userId: number) {
    return this.getOrCreateCart(userId);
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);

    const product = await this.productsService.findOne(dto.productId);
    if (!product) throw new NotFoundException('Product not found');

    if (dto.quantity > product.stock) {
      throw new BadRequestException('Not enough stock');
    }

    let item = cart.items.find((i) => i.product.id === dto.productId);

    if (item) {
      const newQty = item.quantity + dto.quantity;

      if (newQty > product.stock) {
        throw new BadRequestException('Exceeds stock');
      }

      item.quantity = newQty;
      const savedItem = await this.itemsRepo.save(item);
      await this.analyticsService.captureEvent({
        userId,
        eventType: AnalyticsEventType.ADD_TO_CART,
        metadata: { productId: dto.productId, quantity: dto.quantity },
      });
      return savedItem;
    }

    item = this.itemsRepo.create({
      cart,
      product,
      quantity: dto.quantity,
    });

    const savedItem = await this.itemsRepo.save(item);
    await this.analyticsService.captureEvent({
      userId,
      eventType: AnalyticsEventType.ADD_TO_CART,
      metadata: { productId: dto.productId, quantity: dto.quantity },
    });
    return savedItem;
  }

  async updateItem(userId: number, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = cart.items.find((i) => i.product.id === dto.productId);
    if (!item) throw new NotFoundException('Item not in cart');

    const product = await this.productsService.findOne(dto.productId);
    if (!product) throw new NotFoundException('Product not found');

    if (dto.quantity > product.stock) {
      throw new BadRequestException('Not enough stock');
    }

    item.quantity = dto.quantity;
    return this.itemsRepo.save(item);
  }

  async removeItem(userId: number, dto: RemoveFromCartDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = cart.items.find((i) => i.product.id === dto.productId);
    if (!item) return { success: true };

    await this.itemsRepo.delete(item.id);
    return { success: true };
  }

  async removeAllItems(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    for (const item of cart.items) {
      await this.itemsRepo.delete(item.id);
    }
    cart.items = [];
    return true;
  }
}
