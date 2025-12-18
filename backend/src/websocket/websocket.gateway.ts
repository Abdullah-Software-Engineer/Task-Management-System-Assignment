import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';

export interface TaskUpdateEvent {
  type: 'task.created' | 'task.updated' | 'task.deleted' | 'task.assigned';
  task: any;
}

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // In production, check against FRONTEND_URL
      const allowedOrigin = process.env.FRONTEND_URL;
      if (allowedOrigin && origin === allowedOrigin) {
        callback(null, true);
      } else if (!allowedOrigin) {
        // If no FRONTEND_URL set, allow all in production (not recommended)
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
  namespace: '/tasks',
})
export class TasksGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('TasksGateway');
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        this.logger.warn(`Client ${client.id} disconnected: Invalid user`);
        client.disconnect();
        return;
      }

      this.connectedUsers.set(client.id, user.id);
      client.join(`user:${user.id}`);
      this.logger.log(`Client ${client.id} connected (User: ${user.email})`);

      // Notify user of successful connection
      client.emit('connected', { userId: user.id, message: 'Connected to task updates' });
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected (User: ${userId || 'unknown'})`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to task updates`);
    return { event: 'subscribed', message: 'You are now subscribed to task updates' };
  }

  emitTaskUpdate(event: TaskUpdateEvent) {
    this.logger.log(`Emitting task update: ${event.type}`);
    
    // Emit to all connected clients
    this.server.emit('task:update', event);

    // If task is assigned, notify the assigned user specifically
    if (event.type === 'task.assigned' || (event.type === 'task.created' && event.task.assignedToId)) {
      const assignedUserId = event.task.assignedToId;
      if (assignedUserId) {
        this.server.to(`user:${assignedUserId}`).emit('task:assigned', event);
      }
    }
  }
}

