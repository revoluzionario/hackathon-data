import { BadRequestException, Injectable } from '@nestjs/common';
import { AnalyticsEventType } from '../constants/event-types';

@Injectable()
export class AnalyticsValidationService {
  validate(eventType: AnalyticsEventType, metadata: any) {
    switch (eventType) {
      case AnalyticsEventType.PAGE_VIEW:
        this.require(metadata, ['path']);
        break;

      case AnalyticsEventType.VIEW_CATEGORY:
        this.require(metadata, ['categoryId']);
        break;

      case AnalyticsEventType.VIEW_PRODUCT:
        this.require(metadata, ['productId']);
        break;

      case AnalyticsEventType.VIEW_POST:
        this.require(metadata, ['postId']);
        break;

      case AnalyticsEventType.ADD_TO_CART:
      case AnalyticsEventType.REMOVE_FROM_CART:
        this.require(metadata, ['productId', 'quantity']);
        break;

      case AnalyticsEventType.CHECKOUT_START:
        break;

      case AnalyticsEventType.PAYMENT_SUCCESS:
        this.require(metadata, ['orderId', 'total']);
        break;

      case AnalyticsEventType.DWELL_TIME:
        this.require(metadata, ['duration']);
        break;
    }
  }

  private require(metadata: any, keys: string[]) {
    for (const key of keys) {
      if (metadata[key] === undefined) {
        throw new BadRequestException(`Missing required metadata: ${key}`);
      }
    }
  }
}
