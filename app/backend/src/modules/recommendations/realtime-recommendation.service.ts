import { Injectable, Logger } from '@nestjs/common';
import { KqlQueryService } from '../analytics/services/kql-query.service';
import { RecommendationItemDto } from './dto/recommendation-response.dto';

@Injectable()
export class RealtimeRecommendationService {
  private readonly logger = new Logger(RealtimeRecommendationService.name);

  constructor(private readonly kql: KqlQueryService) {}

  async getRealtimeTrending(limit = 20): Promise<RecommendationItemDto[]> {
    const query = `
      realtime_views
      | where timestamp > ago(10m)
      | summarize views = count() by productId
      | top ${limit} by views desc
    `;

    return this.runRealtimeQuery(query, 'productId', 'views');
  }

  async getRealtimeCoViewed(productId: number, limit = 20): Promise<RecommendationItemDto[]> {
    const cleanedId = this.cleanId(productId);
    if (!cleanedId) {
      return [];
    }

    const query = `
      let sessions = realtime_views
        | where productId == "${cleanedId}"
        | distinct sessionId;

      realtime_views
      | where sessionId in (sessions)
      | where productId != "${cleanedId}"
      | summarize freq = count() by productId
      | top ${limit} by freq desc
    `;

    return this.runRealtimeQuery(query, 'productId', 'freq');
  }

  async getRealtimeCategoryTrending(categoryId: string, limit = 20): Promise<RecommendationItemDto[]> {
    if (!categoryId) {
      return [];
    }
    const sanitizedCategory = categoryId.replace(/"/g, '');

    const query = `
      realtime_views
      | where metadata.categoryId == "${sanitizedCategory}"
      | where timestamp > ago(10m)
      | summarize views = count() by productId
      | top ${limit} by views desc
    `;

    return this.runRealtimeQuery(query, 'productId', 'views');
  }

  private async runRealtimeQuery(query: string, productKey: string, scoreKey: string): Promise<RecommendationItemDto[]> {
    try {
      const result = await this.kql.query(query);
      const table = result?.tables?.[0] ?? result?.Tables?.[0];
      const rows = table?.rows ?? table?.Rows ?? [];
      const columns = table?.columns ?? table?.Columns ?? [];
      if (!rows.length || !columns.length) {
        return [];
      }

      const productIdx = this.findColumnIndex(columns, productKey);
      const scoreIdx = this.findColumnIndex(columns, scoreKey);
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
          return { productId, score } as RecommendationItemDto;
        })
        .filter((item): item is RecommendationItemDto => Boolean(item));
    } catch (error) {
      this.logger.warn(`Realtime KQL query failed: ${error?.message ?? error}`);
      return [];
    }
  }

  private findColumnIndex(columns: any[], name: string): number {
    return columns.findIndex((col) => {
      const colName = col?.name ?? col?.ColumnName ?? col;
      return typeof colName === 'string' && colName.toLowerCase() === name.toLowerCase();
    });
  }

  private cleanId(productId: number): string | null {
    if (!Number.isFinite(productId)) {
      return null;
    }
    return String(productId).replace(/"/g, '');
  }
}
