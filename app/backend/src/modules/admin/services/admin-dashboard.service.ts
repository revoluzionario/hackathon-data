import { Injectable } from '@nestjs/common';
import { KqlQueryService } from '../../analytics/services/kql-query.service';
import { FabricSqlService } from './fabric-sql.service';

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly kql: KqlQueryService,
    private readonly sql: FabricSqlService,
  ) {}

  async getOnlineUsers() {
    const kql = `
      realtime_views
      | where timestamp > ago(5m)
      | summarize users = dcount(userId)
    `;
    const res = await this.kql.query(kql);
    const value = res?.tables?.[0]?.rows?.[0]?.[0] ?? 0;
    return { value };
  }

  async getMostViewedProducts(limit = 10) {
    const kql = `
      realtime_views
      | where timestamp > ago(10m)
      | summarize views = count() by productId
      | top ${limit} by views desc
    `;
    const res = await this.kql.query(kql);
    const rows = res?.tables?.[0]?.rows ?? [];

    return rows.map((r: any[]) => ({
      productId: r?.[0],
      views: r?.[1] ?? 0,
    }));
  }

  async getConversionRate() {
    const kql = `
      let checkouts =
        realtime_checkout
        | where eventType == "checkout_start"
        | where timestamp > ago(30m)
        | count();

      let paid =
        realtime_checkout
        | where eventType == "payment_success"
        | where timestamp > ago(30m)
        | count();

      print conversion = todouble(paid)/todouble(checkouts)
    `;
    const res = await this.kql.query(kql);
    const value = res?.tables?.[0]?.rows?.[0]?.[0] ?? 0;
    return { value };
  }

  async getReturnUserRate() {
    const sql = `
      SELECT
        returning_users,
        total_users,
        returning_users::float / NULLIF(total_users, 0) AS return_rate
      FROM gold_user_retention
      ORDER BY date DESC
      LIMIT 1
    `;
    const res = await this.sql.runSql(sql);
    const row = res?.Tables?.[0]?.Rows?.[0] ?? {};
    const value = row.return_rate ?? row.returnRate ?? 0;

    return {
      value,
    };
  }

  async getFusionAnalytics() {
    const [online, mostViewed, conversion, retention] = await Promise.all([
      this.getOnlineUsers(),
      this.getMostViewedProducts(10),
      this.getConversionRate(),
      this.getReturnUserRate(),
    ]);

    return {
      onlineUsers: online,
      conversionRate: conversion,
      returnUserRate: retention,
      mostViewedProducts: mostViewed,
      mlSignals: {
        modelVersion: 'als_v1',
        enabled: true,
      },
    };
  }
}
