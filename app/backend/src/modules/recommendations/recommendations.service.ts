import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';
import { KqlQueryService } from '../analytics/services/kql-query.service';
import { FabricSqlService } from '../admin/services/fabric-sql.service';
import {
  HomepageRecommendationDto,
  ProductRecommendationDto,
  RecommendationItemDto,
} from './dto/recommendation-response.dto';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly eventsRepo: Repository<AnalyticsEvent>,
    private readonly kql: KqlQueryService,
    private readonly sql: FabricSqlService,
  ) {}

  async getTrendingProducts(limit = 10): Promise<RecommendationItemDto[]> {
    const raw = await this.eventsRepo.query(`
      SELECT 
        metadata->>'productId' AS productId,
        COUNT(*) AS views
      FROM analytics_events
      WHERE eventType = 'view_product'
        AND created_at > NOW() - INTERVAL '24 hours'
      GROUP BY productId
      ORDER BY views DESC
      LIMIT ${limit};
    `);

    const baseline = this.mapPostgresResults(raw, 'productid', 'views');
    const realtimeBoost = await this.fetchTrendingFromKql(limit);
    if (!baseline.length && realtimeBoost.length) {
      return realtimeBoost;
    }

    const boostMap = new Map(realtimeBoost.map((item) => [item.productId, item.score]));
    const conversionMultiplier = await this.getDailyConversionRateMultiplier();

    return baseline.map((item) => ({
      productId: item.productId,
      score: Number((item.score * conversionMultiplier) + (boostMap.get(item.productId) ?? 0)),
    }));
  }

  async getWeeklyPopular(limit = 10): Promise<RecommendationItemDto[]> {
    const raw = await this.eventsRepo.query(`
      SELECT 
        metadata->>'productId' AS productId,
        COUNT(*) AS views
      FROM analytics_events
      WHERE eventType = 'view_product'
        AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY productId
      ORDER BY views DESC
      LIMIT ${limit};
    `);

    return this.mapPostgresResults(raw, 'productid', 'views');
  }

  async getRelatedProducts(productId: number, limit = 10): Promise<RecommendationItemDto[]> {
    const normalizedId = Number(productId);
    if (!Number.isFinite(normalizedId)) {
      return [];
    }

    const raw = await this.eventsRepo.query(`
      WITH product_sessions AS (
        SELECT sessionId
        FROM analytics_events
        WHERE eventType = 'view_product'
          AND metadata->>'productId' = '${normalizedId}'
          AND sessionId IS NOT NULL
      )
      SELECT 
        metadata->>'productId' AS productId,
        COUNT(*) AS freq
      FROM analytics_events
      WHERE eventType = 'view_product'
        AND sessionId IN (SELECT sessionId FROM product_sessions)
        AND metadata->>'productId' <> '${normalizedId}'
      GROUP BY productId
      ORDER BY freq DESC
      LIMIT ${limit};
    `);

    return this.mapPostgresResults(raw, 'productid', 'freq');
  }

  async getHomepageRecommendations(): Promise<HomepageRecommendationDto> {
    const [trending, weekly] = await Promise.all([
      this.getTrendingProducts(10),
      this.getWeeklyPopular(10),
    ]);

    return { trending, weekly };
  }

  async getProductRecommendations(productId: number): Promise<ProductRecommendationDto> {
    const [related, trending] = await Promise.all([
      this.getRelatedProducts(productId, 10),
      this.getTrendingProducts(5),
    ]);

    return { related, trending };
  }

  private mapPostgresResults(
    rows: any[],
    idKey: string,
    scoreKey: string,
  ): RecommendationItemDto[] {
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows
      .map((row) => {
        const productIdValue = this.pickValue(row, [idKey, idKey.toLowerCase(), 'productId', 'productid']);
        const scoreValue = this.pickValue(row, [scoreKey, scoreKey.toLowerCase(), 'views', 'freq']);
        const productId = Number(productIdValue);
        const score = Number(scoreValue);
        if (!Number.isFinite(productId) || !Number.isFinite(score)) {
          return null;
        }
        return { productId, score } as RecommendationItemDto;
      })
      .filter((item): item is RecommendationItemDto => Boolean(item));
  }

  private pickValue(row: Record<string, any>, keys: (string | undefined)[]): any {
    for (const key of keys) {
      if (!key) continue;
      if (row[key] !== undefined) {
        return row[key];
      }
    }
    return undefined;
  }

  private async fetchTrendingFromKql(limit: number): Promise<RecommendationItemDto[]> {
    try {
      const kql = `
        realtime_events
        | where eventType == "view_product"
        | summarize views = count() by productId=tostring(metadata.productId)
        | top ${limit} by views
      `;
      const result = await this.kql.query(kql);
      return this.parseKqlResult(result, 'productId', 'views');
    } catch (error) {
      this.logger.warn(`KQL trending fallback failed: ${error?.message ?? error}`);
      return [];
    }
  }

  private parseKqlResult(
    data: any,
    productColumn: string,
    scoreColumn: string,
  ): RecommendationItemDto[] {
    const table = data?.Tables?.[0] ?? data?.tables?.[0];
    if (!table) {
      return [];
    }

    const columns = (table.Columns ?? table.columns ?? []).map((col: any) => col?.ColumnName ?? col?.name);
    const rows = table.Rows ?? table.rows ?? [];
    const productIdx = columns.findIndex((name: string) => name?.toLowerCase() === productColumn.toLowerCase());
    const scoreIdx = columns.findIndex((name: string) => name?.toLowerCase() === scoreColumn.toLowerCase());
    if (productIdx === -1 || scoreIdx === -1) {
      return [];
    }

    return rows
      .map((row: any[]) => {
        const productId = Number(row[productIdx]);
        const score = Number(row[scoreIdx]);
        if (!Number.isFinite(productId) || !Number.isFinite(score)) {
          return null;
        }
        return { productId, score };
      })
      .filter((item): item is RecommendationItemDto => Boolean(item));
  }

  private async getDailyConversionRateMultiplier(): Promise<number> {
    try {
      const data = await this.sql.queryDailyReport();
      const rows = this.extractGenericRows(data);
      if (!rows.length) {
        return 1;
      }
      const conversion = rows[0].conversion_rate ?? rows[0].conversionRate ?? rows[0][5];
      const numeric = Number(conversion);
      return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
    } catch (error) {
      this.logger.warn(`Fabric SQL daily report unavailable: ${error?.message ?? error}`);
      return 1;
    }
  }

  private extractGenericRows(data: any): any[] {
    if (!data) {
      return [];
    }
    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data?.rows)) {
      return data.rows;
    }
    if (Array.isArray(data?.Tables?.[0]?.Rows)) {
      return data.Tables[0].Rows;
    }
    if (Array.isArray(data?.results)) {
      return data.results;
    }
    if (Array.isArray(data?.value)) {
      return data.value;
    }
    return [];
  }
}
