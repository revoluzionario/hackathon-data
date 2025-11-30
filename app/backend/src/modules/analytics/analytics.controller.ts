import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { AnalyticsService } from './analytics.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @Public()
  async track(
    @CurrentUser() user: User | null,
    @Body() dto: CreateEventDto,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.analyticsService.captureEvent({
      userId: user?.id ?? 0,
      sessionId: sessionId || dto.sessionId || null,
      eventType: dto.eventType,
      metadata: dto.metadata,
      source: dto.source || 'frontend',
    });
  }
}
