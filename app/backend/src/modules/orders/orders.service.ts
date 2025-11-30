import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsEventType } from '../analytics/constants/event-types';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { PaymentService } from './payment.service';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private itemsRepo: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly analyticsService: AnalyticsService,
    private readonly paymentService: PaymentService,
  ) {}

  async createOrderFromCart(userId: number) {
    const cart = await this.cartService.getCart(userId);

    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    let total = 0;

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new BadRequestException(`Not enough stock for product ${item.product.name}`);
      }
      total += Number(item.product.price) * item.quantity;
    }

    const order = this.ordersRepo.create({
      user: cart.user,
      items: [],
      total_amount: total,
      payment_status: 'pending',
    });

    await this.ordersRepo.save(order);

    for (const cartItem of cart.items) {
      const orderItem = this.itemsRepo.create({
        order,
        product: cartItem.product,
        price: cartItem.product.price,
        quantity: cartItem.quantity,
      });
      await this.itemsRepo.save(orderItem);
    }

    return order;
  }

  async initiatePayment(order: Order, method: string) {
    if (method === 'stripe') {
      return this.paymentService.createPaymentIntent(
        order.id,
        Number(order.total_amount),
      );
    }

    if (method === 'test') {
      return { paymentUrl: `/orders/mock-payment/${order.id}` };
    }

    throw new BadRequestException('Unsupported payment method');
  }

  async finalizePayment(orderId: number, status: 'paid' | 'failed') {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.payment_status === 'paid') {
      return order;
    }

    order.payment_status = status;
    await this.ordersRepo.save(order);

    if (status === 'paid') {
      for (const item of order.items) {
        const product = await this.productsService.findOne(item.product.id);
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        product.stock -= item.quantity;
        await this.productsService.update(product.id, { stock: product.stock });
      }

      await this.cartService.removeAllItems(order.user.id);

      await this.analyticsService.captureEvent({
        userId: order.user.id,
        eventType: AnalyticsEventType.PAYMENT_SUCCESS,
        metadata: {
          orderId: order.id,
          total: order.total_amount,
        },
      });
    }

    return order;
  }
}
