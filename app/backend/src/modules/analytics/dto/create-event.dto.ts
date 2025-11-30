import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { AnalyticsEventType } from '../constants/event-types';

export class CreateEventDto {
  @IsEnum(AnalyticsEventType)
  eventType: AnalyticsEventType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
