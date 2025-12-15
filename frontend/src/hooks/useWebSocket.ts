'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Task } from '@/types';

interface TaskUpdateEvent {
  type: 'task.created' | 'task.updated' | 'task.deleted' | 'task.assigned';
  task: Task | { id: string };
}

export const useWebSocket = (
  token: string | null,
  onTaskUpdate?: (event: TaskUpdateEvent) => void,
) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const socket = io(`${wsUrl}/tasks`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('subscribe');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connected', (data) => {
      console.log('WebSocket connected:', data);
    });

    socket.on('task:update', (event: TaskUpdateEvent) => {
      if (onTaskUpdate) {
        onTaskUpdate(event);
      }
    });

    socket.on('task:assigned', (event: TaskUpdateEvent) => {
      if (onTaskUpdate) {
        onTaskUpdate(event);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, onTaskUpdate]);

  return { connected, socket: socketRef.current };
};

