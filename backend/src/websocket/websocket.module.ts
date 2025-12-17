import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TasksGateway } from './websocket.gateway';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, JwtModule],
  providers: [TasksGateway],
  exports: [TasksGateway],
})
export class WebSocketModule {}

