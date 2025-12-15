import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventLogDocument = EventLog & Document;

@Schema({ timestamps: true })
export class EventLog {
  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  entityType: string;

  @Prop()
  entityId: string;

  @Prop()
  userId: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  message: string;
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);

