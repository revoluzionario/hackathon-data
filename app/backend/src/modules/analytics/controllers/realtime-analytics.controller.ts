import { Controller, Get } from '@nestjs/common';
import { KqlQueryService } from '../services/kql-query.service';

@Controller('analytics/realtime')
export class RealtimeAnalyticsController {
  constructor(private readonly kql: KqlQueryService) {}

  @Get('most-viewed-products')
  async mostViewedProducts() {
    const kql = `
      realtime_events
      | where eventType == "view_product"
      | where timestamp > ago(10m)
      | summarize count() by productId=tostring(metadata.productId)
      | top 20 by count_
    `;
    return this.kql.query(kql);
  }

  @Get('active-users')
  async activeUsers() {
    const kql = `
      realtime_events
      | where eventType == "page_view"
      | where timestamp > ago(5m)
      | summarize users = dcount(userId)
    `;
    return this.kql.query(kql);
  }

  @Get('conversion-rate')
  async conversionRate() {
    const kql = `
      let views = realtime_events
        | where eventType == "checkout_start"
        | where timestamp > ago(30m)
        | count();
      let paid = realtime_events
        | where eventType == "payment_success"
        | where timestamp > ago(30m)
        | count();
      print conversion = todouble(paid)/todouble(views)
    `;
    return this.kql.query(kql);
  }
}
