import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsEventType } from './constants/event-types';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  async captureEvent(data: {
    userId: number;
    sessionId?: string | null;
    eventType: AnalyticsEventType;
    metadata?: Record<string, any>;
    source?: string;
  }) {
    if (
      data.eventType === AnalyticsEventType.DWELL_TIME &&
      (data.metadata?.duration ?? 0) < 5
    ) {
      return { ignored: true };
    }

    this.logger.debug('Analytics event received', {
      eventType: data.eventType,
      userId: data.userId,
      sessionId: data.sessionId,
    });

    return {
      status: 'accepted',
      eventType: data.eventType,
      receivedAt: new Date().toISOString(),
    };
  }
}
