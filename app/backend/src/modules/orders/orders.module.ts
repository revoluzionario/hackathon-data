import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersController } from './orders.controller';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    UsersModule,
    CartModule,
    ProductsModule,
  ],
  controllers: [OrdersController, PaymentController],
  providers: [OrdersService, PaymentService],
})
export class OrdersModule {}
