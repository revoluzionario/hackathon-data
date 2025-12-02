import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { RealtimeAnalyticsController } from './controllers/realtime-analytics.controller';
import { AnalyticsService } from './analytics.service';
import { KqlQueryService } from './services/kql-query.service';

@Module({
  controllers: [AnalyticsController, RealtimeAnalyticsController],
  providers: [AnalyticsService, KqlQueryService],
  exports: [AnalyticsService, KqlQueryService],
})
export class AnalyticsModule {}
