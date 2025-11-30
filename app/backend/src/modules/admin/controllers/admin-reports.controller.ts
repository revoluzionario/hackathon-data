import { Controller, Get, Query } from '@nestjs/common';
import { FabricSqlService } from '../services/fabric-sql.service';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('admin/reports')
@Roles('admin')
export class AdminReportsController {
  constructor(private readonly fabricSql: FabricSqlService) {}

  @Get('daily')
  async dailyReport(@Query('date') date?: string) {
    return this.fabricSql.queryDailyReport(date);
  }

  @Get('weekly')
  async weeklyReport(@Query('week') week?: string) {
    return this.fabricSql.queryWeeklyReport(week);
  }

  @Get('monthly')
  async monthlyReport(@Query('month') month?: string) {
    return this.fabricSql.queryMonthlyReport(month);
  }
}
