import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FabricEventstreamService {
  private readonly logger = new Logger(FabricEventstreamService.name);

  private url = process.env.FABRIC_EVENTSTREAM_URL;
  private apiKey = process.env.FABRIC_EVENTSTREAM_API_KEY;

  async sendEvent(event: any) {
    const maxRetries = 5;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await axios.post(
          this.url,
          event,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
            }
          }
        );

        return true;
      } catch (err) {
        const backoff = Math.pow(2, attempt) * 200; // 200ms → 6.4s
        this.logger.warn(
          `Fabric ingestion failed (attempt ${attempt + 1}): ${err.message}. Retrying in ${backoff}ms...`
        );
        await new Promise(res => setTimeout(res, backoff));
      }
    }

    this.logger.error('Fabric ingestion failed after maximum retries.');
    return false;
  }
}
