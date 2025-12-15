# Task Management Backend

NestJS backend for the Real-Time Collaborative Task Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (see `.env.example`)

3. Start the development server:
```bash
npm run start:dev
```

## API Documentation

The API will be available at `http://localhost:3001`

### Authentication Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### User Endpoints

- `GET /users` - Get all users (Admin only)
- `GET /users/profile` - Get current user profile
- `GET /users/:id` - Get user by ID
- `PUT /users/profile` - Update current user profile
- `PUT /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Task Endpoints

- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create a new task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

## Testing

```bash
npm test
npm run test:watch
npm run test:cov
```

## Database Migrations

TypeORM will automatically synchronize the database schema in development mode. For production, use migrations.

