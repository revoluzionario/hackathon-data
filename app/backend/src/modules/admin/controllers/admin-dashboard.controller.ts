import { Controller, Get } from '@nestjs/common';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('admin/dashboard')
@Roles('admin')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get('online-users')
  async onlineUsers() {
    return this.service.getOnlineUsers();
  }

  @Get('most-viewed-products')
  async mostViewedProducts() {
    return this.service.getMostViewedProducts();
  }

  @Get('conversion-rate')
  async conversionRate() {
    return this.service.getConversionRate();
  }

  @Get('return-user-rate')
  async returnUserRate() {
    return this.service.getReturnUserRate();
  }

  @Get('fusion')
  async fusion() {
    return this.service.getFusionAnalytics();
  }
}
