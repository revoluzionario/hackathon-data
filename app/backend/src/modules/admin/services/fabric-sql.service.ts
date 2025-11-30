import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FabricSqlService {
  private endpoint = process.env.FABRIC_SQL_ENDPOINT;
  private apiKey = process.env.FABRIC_SQL_API_KEY;

  async runSql(sql: string) {
    const res = await axios.post(
      `${this.endpoint}/query`,
      { query: sql },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );
    return res.data;
  }

  async queryDailyReport(date?: string) {
    const sql = `
      SELECT 
        date,
        SUM(total_sales) AS sales,
        SUM(total_orders) AS orders,
        SUM(product_views) AS product_views,
        SUM(add_to_cart_count) AS add_to_cart,
        SUM(conversion_rate) AS conversion_rate
      FROM gold_daily_metrics
      ${date ? `WHERE date = '${date}'` : ''}
      GROUP BY date
      ORDER BY date DESC;
    `;
    return this.runSql(sql);
  }

  async queryWeeklyReport(week?: string) {
    const sql = `
      SELECT
        week,
        SUM(weekly_sales) AS sales,
        SUM(weekly_orders) AS orders,
        SUM(weekly_views) AS views,
        AVG(avg_conversion_rate) AS conversion_rate
      FROM gold_weekly_metrics
      ${week ? `WHERE week = '${week}'` : ''}
      GROUP BY week
      ORDER BY week DESC;
    `;
    return this.runSql(sql);
  }

  async queryMonthlyReport(month?: string) {
    const sql = `
      SELECT
        month,
        SUM(monthly_sales) AS sales,
        SUM(monthly_orders) AS orders,
        SUM(monthly_revenue) AS revenue,
        SUM(monthly_views) AS views,
        SUM(active_users) AS active_users
      FROM gold_monthly_metrics
      ${month ? `WHERE month = '${month}'` : ''}
      GROUP BY month
      ORDER BY month DESC;
    `;
    return this.runSql(sql);
  }
}
