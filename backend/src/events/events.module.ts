import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventLog, EventLogSchema } from './schemas/event-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EventLog.name, schema: EventLogSchema }]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

