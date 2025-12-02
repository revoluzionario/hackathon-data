import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { KqlQueryService } from '../analytics/services/kql-query.service';
import { DatabricksSqlService } from '../admin/services/databricks-sql.service';
import { RealtimeRecommendationService } from './realtime-recommendation.service';
import { MLRecommendationService } from './ml/ml-recommendation.service';
import { MLModelProvider } from './ml/model.provider';
import { UnifiedRecommendationService } from './unified/unified-recommendation.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsEvent])],
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    RealtimeRecommendationService,
    MLModelProvider,
    MLRecommendationService,
    UnifiedRecommendationService,
    KqlQueryService,
    DatabricksSqlService,
  ],
  exports: [
    RecommendationsService,
    RealtimeRecommendationService,
    MLModelProvider,
    MLRecommendationService,
    UnifiedRecommendationService,
  ],
})
export class RecommendationsModule {}
