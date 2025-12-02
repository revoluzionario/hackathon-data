import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface DatabricksStatementResponse {
  statement_id?: string;
  status?: {
    state?: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | string;
    error?: {
      message?: string;
      error_code?: string;
    };
  };
  result?: {
    data_array?: any[][];
    schema?: {
      columns?: Array<{ name?: string; type_text?: string }>;
    };
  };
}

export interface DatabricksQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  Tables: Array<{
    Columns: Array<{ ColumnName: string; ordinal: number }>;
    Rows: any[][];
  }>;
  raw: DatabricksStatementResponse;
}

@Injectable()
export class DatabricksSqlService {
  private readonly logger = new Logger(DatabricksSqlService.name);

  private readonly endpoint = this.normalizeEndpoint(
    process.env.DATABRICKS_SQL_ENDPOINT,
  );
  private readonly warehouseId = process.env.DATABRICKS_SQL_WAREHOUSE_ID ?? '';
  private readonly token = process.env.DATABRICKS_API_TOKEN ?? '';
  private readonly catalog = process.env.DATABRICKS_SQL_CATALOG;
  private readonly schema = process.env.DATABRICKS_SQL_SCHEMA;
  private readonly waitTimeoutSeconds = Number(
    process.env.DATABRICKS_SQL_WAIT_TIMEOUT ?? 60,
  );

  async runSql(statement: string): Promise<DatabricksQueryResult> {
    this.assertConfig();
    const payload = {
      statement,
      warehouse_id: this.warehouseId,
      wait_timeout: `${this.waitTimeoutSeconds}s`,
      catalog: this.catalog,
      schema: this.schema,
      parameters: [],
      result_format: 'JSON_ARRAY',
    };

    const response = await axios.post<DatabricksStatementResponse>(
      `${this.endpoint}/api/2.0/sql/statements`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const status = response.data.status?.state;
    if (status === 'FAILED') {
      const message =
        response.data.status?.error?.message ?? 'Databricks SQL query failed';
      this.logger.error(message);
      throw new Error(message);
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(
        `Databricks SQL query did not finish within ${this.waitTimeoutSeconds}s (state: ${status})`,
      );
    }

    return this.normalizeResult(response.data);
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

  private normalizeResult(
    response: DatabricksStatementResponse,
  ): DatabricksQueryResult {
    const columns = response.result?.schema?.columns?.map((c) => c.name || '') ?? [];
    const dataArray = response.result?.data_array ?? [];

    const rows = dataArray.map((row) => {
      const record: Record<string, any> = {};
      columns.forEach((name, index) => {
        record[name || `col_${index}`] = row[index];
      });
      return record;
    });

    const tableRows = dataArray.map((row) => [...row]);

    const tableColumns = columns.map((name, ordinal) => ({
      ColumnName: name || `col_${ordinal}`,
      ordinal,
    }));

    return {
      columns,
      rows,
      Tables: [
        {
          Columns: tableColumns,
          Rows: tableRows,
        },
      ],
      raw: response,
    };
  }

  private normalizeEndpoint(endpoint?: string) {
    if (!endpoint) {
      return '';
    }
    return endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
  }

  private assertConfig() {
    if (!this.endpoint) {
      throw new Error('DATABRICKS_SQL_ENDPOINT is not configured');
    }
    if (!this.warehouseId) {
      throw new Error('DATABRICKS_SQL_WAREHOUSE_ID is not configured');
    }
    if (!this.token) {
      throw new Error('DATABRICKS_API_TOKEN is not configured');
    }
  }
}
