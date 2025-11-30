export interface FabricEventPayload {
  eventType: string;
  userId: number;
  sessionId?: string;
  metadata: Record<string, any>;
  source: string;
  timestamp: string;
}
