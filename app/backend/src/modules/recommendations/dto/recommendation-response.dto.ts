export class RecommendationItemDto {
  productId: number;
  score: number;
}

export class HomepageRecommendationDto {
  trending: RecommendationItemDto[];
  weekly: RecommendationItemDto[];
}

export class ProductRecommendationDto {
  related: RecommendationItemDto[];
  trending: RecommendationItemDto[];
}
