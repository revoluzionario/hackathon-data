import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'varchar', nullable: true })
  sessionId: string | null;

  @Column()
  eventType: string;

  @Column({ type: 'jsonb' })
  metadata: Record<string, any>;

  @Column()
  source: string;

  @CreateDateColumn()
  created_at: Date;
}
