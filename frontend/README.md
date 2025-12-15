# Task Management Frontend

Next.js frontend for the Real-Time Collaborative Task Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

- User authentication (Login/Register)
- Task dashboard with real-time updates
- Create, edit, delete tasks
- Assign tasks to users
- Filter tasks by status
- Responsive design

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Build

```bash
npm run build
npm start
```

