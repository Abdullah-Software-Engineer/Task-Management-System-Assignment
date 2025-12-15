# Real-Time Collaborative Task Management System

A full-stack application built with React (Next.js), Node.js (NestJS), TypeScript, PostgreSQL, and MongoDB. Features real-time task updates using WebSockets.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, User)
- **Task Management**: Full CRUD operations for tasks with assignment capabilities
- **Real-Time Updates**: WebSocket integration for live task updates
- **Dual Database**: PostgreSQL for relational data, MongoDB for event logging
- **Caching**: Redis integration for frequently accessed data
- **Responsive UI**: Modern, responsive design with Tailwind CSS
- **Testing**: Unit tests for both backend and frontend

## Tech Stack

### Backend
- NestJS (Node.js framework)
- TypeORM (PostgreSQL ORM)
- MongoDB with Mongoose
- Redis (caching)
- Socket.io (WebSockets)
- JWT (authentication)
- Jest (testing)

### Frontend
- Next.js 14 (React framework)
- TypeScript
- React Query (data fetching & caching)
- Socket.io Client (WebSocket client)
- Tailwind CSS (styling)
- Jest + React Testing Library (testing)

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for containerized setup)
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-system
```

2. Start all services:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- MongoDB on port 27017
- Redis on port 6379
- Backend API on port 3001
- Frontend on port 3000

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=task_management

MONGODB_URI=mongodb://localhost:27017/task_management

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

REDIS_HOST=localhost
REDIS_PORT=6379

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

5. Start the backend:
```bash
npm run start:dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

4. Start the frontend:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/profile` - Get current user profile
- `GET /users/:id` - Get user by ID
- `PUT /users/profile` - Update current user profile
- `PUT /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Tasks
- `GET /tasks` - Get all tasks (filtered by user role)
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create a new task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

### Events (Admin only)
- `GET /events/logs` - Get event logs

## WebSocket Events

The WebSocket server is available at `/tasks` namespace.

### Client Events
- `subscribe` - Subscribe to task updates

### Server Events
- `connected` - Connection established
- `task:update` - Task created, updated, or deleted
- `task:assigned` - Task assigned to a user

## Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:watch
npm run test:cov
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:watch
npm run test:coverage
```

## Docker

### Build Images
```bash
docker-compose build
```

### Run Services
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

## Cloudflare Tunnel Setup

1. Install Cloudflare Tunnel:
```bash
# Linux/Mac
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared

# Or use package manager
```

2. Create a tunnel:
```bash
cloudflared tunnel create task-management
```

3. Configure the tunnel (edit `cloudflare-tunnel.yml`):
```yaml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json

ingress:
  - hostname: tasks.yourdomain.com
    service: http://localhost:3000
  - hostname: api.tasks.yourdomain.com
    service: http://localhost:3001
  - service: http_status:404
```

4. Run the tunnel:
```bash
cloudflared tunnel --config cloudflare-tunnel.yml run
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # User management
│   │   ├── tasks/         # Task management
│   │   ├── events/        # Event logging (MongoDB)
│   │   ├── websocket/     # WebSocket gateway
│   │   └── main.ts        # Application entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   └── types/        # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── cloudflare-tunnel.yml
└── README.md
```

## Environment Variables

### Backend
- `POSTGRES_HOST` - PostgreSQL host
- `POSTGRES_PORT` - PostgreSQL port
- `POSTGRES_USER` - PostgreSQL user
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_DB` - PostgreSQL database name
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time
- `PORT` - Backend server port
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

MIT

