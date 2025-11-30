import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { RealtimeAnalyticsController } from './controllers/realtime-analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsValidationService } from './services/validation.service';
import { FabricEventstreamService } from './services/fabric-eventstream.service';
import { KqlQueryService } from './services/kql-query.service';
import { PageViewHandler } from './handlers/page-view.handler';
import { ViewCategoryHandler } from './handlers/view-category.handler';
import { ViewProductHandler } from './handlers/view-product.handler';
import { AddToCartHandler } from './handlers/add-to-cart.handler';
import { RemoveFromCartHandler } from './handlers/remove-from-cart.handler';
import { CheckoutStartHandler } from './handlers/checkout-start.handler';
import { PaymentSuccessHandler } from './handlers/payment-success.handler';
import { DwellTimeHandler } from './handlers/dwell-time.handler';
import { ViewPostHandler } from './handlers/view-post.handler';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsEvent])],
  controllers: [AnalyticsController, RealtimeAnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsValidationService,
    FabricEventstreamService,
    KqlQueryService,
    PageViewHandler,
    ViewCategoryHandler,
    ViewProductHandler,
    AddToCartHandler,
    RemoveFromCartHandler,
    CheckoutStartHandler,
    PaymentSuccessHandler,
    DwellTimeHandler,
    ViewPostHandler,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
