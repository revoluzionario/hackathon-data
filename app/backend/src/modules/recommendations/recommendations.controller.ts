import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RealtimeRecommendationService } from './realtime-recommendation.service';
import { MLRecommendationService } from './ml/ml-recommendation.service';
import { UnifiedRecommendationService } from './unified/unified-recommendation.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('recommendations')
@Public()
export class RecommendationsController {
  constructor(
    private readonly service: RecommendationsService,
    private readonly realtime: RealtimeRecommendationService,
    private readonly ml: MLRecommendationService,
    private readonly unified: UnifiedRecommendationService,
  ) {}

  @Get('homepage')
  async homepage() {
    return this.service.getHomepageRecommendations();
  }

  @Get('product/:id')
  async product(@Param('id') id: string) {
    return this.service.getProductRecommendations(Number(id));
  }

  @Get('homepage/realtime')
  async homepageRealtime() {
    return this.realtime.getRealtimeTrending(20);
  }

  @Get('product/:id/realtime')
  async productRealtime(@Param('id') id: string) {
    return this.realtime.getRealtimeCoViewed(Number(id), 20);
  }

  @Get('category/:categoryId/realtime')
  async categoryRealtime(@Param('categoryId') categoryId: string) {
    return this.realtime.getRealtimeCategoryTrending(categoryId, 20);
  }

  @Get('user/:id/ml')
  async recommendML(@Param('id') id: string) {
    return this.ml.recommendForUser(Number(id), 10);
  }

  @Get('user/:id/unified')
  async unifiedUser(@Param('id') id: string) {
    return this.unified.unifiedForUser(Number(id), 20);
  }

  @Get('product/:id/unified')
  async unifiedProduct(@Param('id') id: string) {
    return this.unified.unifiedForProduct(Number(id), 20);
  }
}
