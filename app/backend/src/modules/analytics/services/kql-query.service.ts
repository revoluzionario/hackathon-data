import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class KqlQueryService {
  private readonly logger = new Logger(KqlQueryService.name);

  async query(kql: string) {
    this.logger.debug(`KQL query skipped (analytics disabled): ${kql}`);
    return { tables: [] };
  }
}
