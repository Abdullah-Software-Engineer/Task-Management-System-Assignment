import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { EventsService } from '../events/events.service';
import { TasksGateway } from '../websocket/websocket.gateway';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashed',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    createdTasks: [],
    assignedTasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    createdBy: mockUser,
    createdById: '1',
    assignedTo: null,
    assignedToId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Task;

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockEventsService = {
    logEvent: jest.fn(),
  };

  const mockWebSocketGateway = {
    emitTaskUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: TasksGateway,
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'New Description',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto, '1');

      expect(result).toEqual(mockTask);
      expect(mockTaskRepository.create).toHaveBeenCalled();
      expect(mockTaskRepository.save).toHaveBeenCalled();
      expect(mockEventsService.logEvent).toHaveBeenCalled();
      expect(mockWebSocketGateway.emitTaskUpdate).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({ title: 'New Task' }, '1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a task if user has permission', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('1', mockUser);

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      const otherUser = { ...mockUser, id: '2' };
      const task = { ...mockTask, createdById: '3', assignedToId: null };

      mockTaskRepository.findOne.mockResolvedValue(task);

      await expect(service.findOne('1', otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

