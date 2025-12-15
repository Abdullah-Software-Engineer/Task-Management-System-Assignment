import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { EventsService } from '../events/events.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private eventsService: EventsService,
    private webSocketGateway: WebSocketGateway,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let assignedTo = null;
    if (createTaskDto.assignedToId) {
      assignedTo = await this.usersRepository.findOne({
        where: { id: createTaskDto.assignedToId },
      });
      if (!assignedTo) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    const task = this.tasksRepository.create({
      ...createTaskDto,
      createdBy: user,
      assignedTo,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
    });

    const savedTask = await this.tasksRepository.save(task);

    // Log event
    await this.eventsService.logEvent({
      eventType: 'task.created',
      entityType: 'task',
      entityId: savedTask.id,
      userId,
      metadata: { task: savedTask },
      message: `Task "${savedTask.title}" was created`,
    });

    // Emit WebSocket event
    this.webSocketGateway.emitTaskUpdate({
      type: 'task.created',
      task: savedTask,
    });

    return savedTask;
  }

  async findAll(user: User): Promise<Task[]> {
    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo');

    // Regular users can only see tasks they created or are assigned to
    if (user.role === UserRole.USER) {
      queryBuilder.where(
        'task.createdById = :userId OR task.assignedToId = :userId',
        { userId: user.id },
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check permissions
    if (
      user.role === UserRole.USER &&
      task.createdById !== user.id &&
      task.assignedToId !== user.id
    ) {
      throw new ForbiddenException('You do not have permission to view this task');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.findOne(id, user);

    // Check permissions
    if (
      user.role === UserRole.USER &&
      task.createdById !== user.id &&
      task.assignedToId !== user.id
    ) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    if (updateTaskDto.assignedToId) {
      const assignedTo = await this.usersRepository.findOne({
        where: { id: updateTaskDto.assignedToId },
      });
      if (!assignedTo) {
        throw new NotFoundException('Assigned user not found');
      }
      task.assignedTo = assignedTo;
    }

    if (updateTaskDto.dueDate) {
      task.dueDate = new Date(updateTaskDto.dueDate);
    }

    Object.assign(task, {
      ...updateTaskDto,
      assignedToId: updateTaskDto.assignedToId || task.assignedToId,
    });

    const updatedTask = await this.tasksRepository.save(task);

    // Log event
    await this.eventsService.logEvent({
      eventType: 'task.updated',
      entityType: 'task',
      entityId: updatedTask.id,
      userId: user.id,
      metadata: { task: updatedTask, changes: updateTaskDto },
      message: `Task "${updatedTask.title}" was updated`,
    });

    // Emit WebSocket event
    this.webSocketGateway.emitTaskUpdate({
      type: 'task.updated',
      task: updatedTask,
    });

    return updatedTask;
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user);

    // Only creator or admin can delete
    if (user.role === UserRole.USER && task.createdById !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.tasksRepository.remove(task);

    // Log event
    await this.eventsService.logEvent({
      eventType: 'task.deleted',
      entityType: 'task',
      entityId: id,
      userId: user.id,
      metadata: { task },
      message: `Task "${task.title}" was deleted`,
    });

    // Emit WebSocket event
    this.webSocketGateway.emitTaskUpdate({
      type: 'task.deleted',
      task: { id },
    });
  }
}

