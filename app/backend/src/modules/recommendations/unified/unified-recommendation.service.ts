import { Injectable } from '@nestjs/common';
import { MLRecommendationService } from '../ml/ml-recommendation.service';
import { RealtimeRecommendationService } from '../realtime-recommendation.service';
import { RecommendationsService } from '../recommendations.service';
import { RecommendationItemDto } from '../dto/recommendation-response.dto';

@Injectable()
export class UnifiedRecommendationService {
  constructor(
    private readonly ml: MLRecommendationService,
    private readonly realtime: RealtimeRecommendationService,
    private readonly rules: RecommendationsService,
  ) {}

  private normalize(map: Map<number, number>) {
    if (map.size === 0) {
      return map;
    }

    const values = [...map.values()];
    const max = Math.max(...values);
    const min = Math.min(...values);

    if (max === min) {
      return map;
    }

    const normalized = new Map<number, number>();
    map.forEach((score, id) => {
      normalized.set(id, (score - min) / (max - min));
    });
    return normalized;
  }

  async unifiedForUser(
    userId: number,
    topK = 20,
  ): Promise<RecommendationItemDto[]> {
    const [mlRec, rtTrending, rbTrending] = await Promise.all([
      this.ml.recommendForUser(userId, topK),
      this.realtime.getRealtimeTrending(topK),
      this.rules.getTrendingProducts(topK),
    ]);

    const mlMap = new Map(mlRec.map((r) => [r.productId, r.score]));
    const rtMap = new Map(rtTrending.map((r) => [r.productId, r.score]));
    const rbMap = new Map(rbTrending.map((r) => [r.productId, r.score]));

    const ML = this.normalize(mlMap);
    const RT = this.normalize(rtMap);
    const RB = this.normalize(rbMap);

    const weights = { w1: 0.55, w2: 0.25, w3: 0.15, w4: 0.05 };

    const final = new Map<number, number>();
    const allIds = new Set([...ML.keys(), ...RT.keys(), ...RB.keys()]);

    allIds.forEach((id) => {
      const mlScore = ML.get(id) ?? 0;
      const rtScore = RT.get(id) ?? 0;
      const rbScore = RB.get(id) ?? 0;

      const blended =
        weights.w1 * mlScore +
        weights.w2 * rtScore +
        weights.w3 * rbScore +
        weights.w4 * rbScore;

      final.set(id, blended);
    });

    return [...final.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([productId, score]) => ({ productId, score }));
  }

  async unifiedForProduct(
    productId: number,
    topK = 20,
  ): Promise<RecommendationItemDto[]> {
    const [rtCoView, rbCoView] = await Promise.all([
      this.realtime.getRealtimeCoViewed(productId, topK),
      this.rules.getRelatedProducts(productId, topK),
    ]);

    const rtMap = new Map(rtCoView.map((r) => [r.productId, r.score]));
    const rbMap = new Map(rbCoView.map((r) => [r.productId, r.score]));

    const RT = this.normalize(rtMap);
    const RB = this.normalize(rbMap);

    const weights = { w2: 0.6, w3: 0.4 };

    const final = new Map<number, number>();
    const allIds = new Set([...RT.keys(), ...RB.keys()]);

    allIds.forEach((id) => {
      const rtScore = RT.get(id) ?? 0;
      const rbScore = RB.get(id) ?? 0;

      const blended = weights.w2 * rtScore + weights.w3 * rbScore;

      final.set(id, blended);
    });

    return [...final.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([pid, score]) => ({ productId: pid, score }));
  }
}
