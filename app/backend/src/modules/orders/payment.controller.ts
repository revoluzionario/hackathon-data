import {
  Controller,
  Post,
  Headers,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrdersService } from './orders.service';

@Controller('orders/payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private ordersService: OrdersService,
  ) {}

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req,
    @Res() res,
  ) {
    const rawBody = req.rawBody;

    const event = this.paymentService.verifyWebhookSignature(
      rawBody,
      signature,
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await this.ordersService.finalizePayment(
          Number(intent.metadata.orderId),
          'paid',
        );
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await this.ordersService.finalizePayment(
          Number(intent.metadata.orderId),
          'failed',
        );
        break;
      }
    }

    return res.status(HttpStatus.OK).send('Webhook received');
  }
}
