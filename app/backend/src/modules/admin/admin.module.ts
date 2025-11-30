import { Module } from '@nestjs/common';
import { AdminReportsController } from './controllers/admin-reports.controller';
import { FabricSqlService } from './services/fabric-sql.service';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { KqlQueryService } from '../analytics/services/kql-query.service';

@Module({
  controllers: [AdminReportsController, AdminDashboardController],
  providers: [AdminDashboardService, FabricSqlService, KqlQueryService],
})
export class AdminModule {}
