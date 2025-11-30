import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  async checkout(@CurrentUser() user: User, @Body() dto: CheckoutDto) {
    const order = await this.ordersService.createOrderFromCart(user.id);
    return this.ordersService.initiatePayment(order, dto.paymentMethod);
  }

  // Mock payment URL for testing
  @Get('mock-payment/:id')
  async mockPayment(@Param('id') id: number) {
    const result = await this.ordersService.finalizePayment(+id, 'paid');
    return {
      message: 'Mock payment successful',
      order: result,
    };
  }

}
