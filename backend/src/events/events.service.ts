import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventLog, EventLogDocument } from './schemas/event-log.schema';

export interface CreateEventLogDto {
  eventType: string;
  entityType: string;
  entityId: string;
  userId: string;
  metadata?: Record<string, any>;
  message: string;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(EventLog.name)
    private eventLogModel: Model<EventLogDocument>,
  ) {}

  async logEvent(createEventLogDto: CreateEventLogDto): Promise<EventLog> {
    const eventLog = new this.eventLogModel(createEventLogDto);
    return eventLog.save();
  }

  async getEventLogs(
    entityType?: string,
    entityId?: string,
    userId?: string,
    limit: number = 100,
  ): Promise<EventLog[]> {
    const query: any = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (userId) query.userId = userId;

    return this.eventLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}

