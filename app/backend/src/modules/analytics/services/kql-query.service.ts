import { Injectable, Logger } from '@nestjs/common';

export interface KqlQueryResultTable {
  rows?: any[][];
  columns?: any[];
  Rows?: any[][];
  Columns?: any[];
}

export interface KqlQueryResult {
  tables?: KqlQueryResultTable[];
  Tables?: KqlQueryResultTable[];
}

@Injectable()
export class KqlQueryService {
  private readonly logger = new Logger(KqlQueryService.name);

  async query(kql: string): Promise<KqlQueryResult> {
    this.logger.debug(`KQL query skipped (analytics disabled): ${kql}`);
    const empty: KqlQueryResult = { tables: [] };
    return empty;
  }
}
