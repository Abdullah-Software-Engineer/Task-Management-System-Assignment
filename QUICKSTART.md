# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed (optional, for containerized setup)
- PostgreSQL, MongoDB, and Redis running (if not using Docker)

## Option 1: Docker Compose (Easiest)

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## Option 2: Manual Setup

### Step 1: Start Databases

Make sure PostgreSQL, MongoDB, and Redis are running on your machine.

### Step 2: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run start:dev
```

Backend will run on http://localhost:3001

### Step 3: Frontend Setup

```bash
cd frontend
npm install
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_WS_URL=http://localhost:3001
npm run dev
```

Frontend will run on http://localhost:3000

## First Steps

1. **Register a new account:**
   - Go to http://localhost:3000/register
   - Create your account

2. **Create your first task:**
   - After logging in, click "Create Task"
   - Fill in the task details
   - Assign it to yourself or another user

3. **Test real-time updates:**
   - Open the app in two different browsers/windows
   - Create or update a task in one window
   - See it update in real-time in the other window!

## Default Admin User

To create an admin user, you can either:
- Register and manually update the database to set role to 'admin'
- Use a database client to insert an admin user directly

## Troubleshooting

### Backend won't start
- Check that PostgreSQL, MongoDB, and Redis are running
- Verify environment variables in `.env` file
- Check port 3001 is not already in use

### Frontend won't start
- Check that backend is running on port 3001
- Verify environment variables in `.env.local`
- Check port 3000 is not already in use

### WebSocket connection fails
- Ensure backend is running
- Check CORS settings in backend
- Verify `NEXT_PUBLIC_WS_URL` is set correctly

### Database connection errors
- Verify database credentials in `.env`
- Check databases are running and accessible
- For Docker setup, ensure containers are healthy

## Development Tips

- Backend hot-reload: Already enabled with `npm run start:dev`
- Frontend hot-reload: Already enabled with `npm run dev`
- Run tests: `npm test` in either backend or frontend directory
- View logs: Use `docker-compose logs -f` for Docker setup

