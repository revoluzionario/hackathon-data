import { Controller, Get, Query } from '@nestjs/common';
import { DatabricksSqlService } from '../services/databricks-sql.service';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('admin/reports')
@Roles('admin')
export class AdminReportsController {
  constructor(private readonly databricksSql: DatabricksSqlService) {}

  @Get('daily')
  async dailyReport(@Query('date') date?: string) {
    return this.databricksSql.queryDailyReport(date);
  }

  @Get('weekly')
  async weeklyReport(@Query('week') week?: string) {
    return this.databricksSql.queryWeeklyReport(week);
  }

  @Get('monthly')
  async monthlyReport(@Query('month') month?: string) {
    return this.databricksSql.queryMonthlyReport(month);
  }
}
