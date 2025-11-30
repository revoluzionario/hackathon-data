import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsEventType } from './constants/event-types';
import { AnalyticsValidationService } from './services/validation.service';
import { PageViewHandler } from './handlers/page-view.handler';
import { ViewCategoryHandler } from './handlers/view-category.handler';
import { ViewProductHandler } from './handlers/view-product.handler';
import { ViewPostHandler } from './handlers/view-post.handler';
import { AddToCartHandler } from './handlers/add-to-cart.handler';
import { RemoveFromCartHandler } from './handlers/remove-from-cart.handler';
import { CheckoutStartHandler } from './handlers/checkout-start.handler';
import { PaymentSuccessHandler } from './handlers/payment-success.handler';
import { DwellTimeHandler } from './handlers/dwell-time.handler';
import { FabricEventstreamService } from './services/fabric-eventstream.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private repo: Repository<AnalyticsEvent>,
    private validationService: AnalyticsValidationService,
    private fabricEventstreamService: FabricEventstreamService,

    private pageViewHandler: PageViewHandler,
    private viewCategoryHandler: ViewCategoryHandler,
    private viewProductHandler: ViewProductHandler,
    private viewPostHandler: ViewPostHandler,
    private addToCartHandler: AddToCartHandler,
    private removeFromCartHandler: RemoveFromCartHandler,
    private checkoutStartHandler: CheckoutStartHandler,
    private paymentSuccessHandler: PaymentSuccessHandler,
    private dwellTimeHandler: DwellTimeHandler,
  ) {}

  async captureEvent(data: {
    userId: number;
    sessionId?: string | null;
    eventType: AnalyticsEventType;
    metadata?: Record<string, any>;
    source?: string;
  }) {
    this.validationService.validate(data.eventType, data.metadata || {});

    if (data.eventType === AnalyticsEventType.DWELL_TIME) {
      if ((data.metadata?.duration ?? 0) < 5) {
        return null;
      }
    }

    const event = this.repo.create({
      userId: data.userId ?? 0,
      sessionId: data.sessionId || null,
      eventType: data.eventType,
      metadata: data.metadata || {},
      source: data.source || 'frontend',
    });

    const saved = await this.repo.save(event);

    const payload = {
      eventType: data.eventType,
      userId: data.userId,
      sessionId: data.sessionId || null,
      metadata: data.metadata || {},
      source: data.source || 'backend',
      timestamp: new Date().toISOString(),
    };

    await this.fabricEventstreamService.sendEvent(payload);
    await this.dispatchHandler(saved);

    return saved;
  }

  async dispatchHandler(event: AnalyticsEvent) {
    switch (event.eventType) {
      case AnalyticsEventType.PAGE_VIEW:
        return this.pageViewHandler.handle(event);
      case AnalyticsEventType.VIEW_CATEGORY:
        return this.viewCategoryHandler.handle(event);
      case AnalyticsEventType.VIEW_PRODUCT:
        return this.viewProductHandler.handle(event);
      case AnalyticsEventType.VIEW_POST:
        return this.viewPostHandler.handle(event);
      case AnalyticsEventType.ADD_TO_CART:
        return this.addToCartHandler.handle(event);
      case AnalyticsEventType.REMOVE_FROM_CART:
        return this.removeFromCartHandler.handle(event);
      case AnalyticsEventType.CHECKOUT_START:
        return this.checkoutStartHandler.handle(event);
      case AnalyticsEventType.PAYMENT_SUCCESS:
        return this.paymentSuccessHandler.handle(event);
      case AnalyticsEventType.DWELL_TIME:
        return this.dwellTimeHandler.handle(event);
    }
  }

}
