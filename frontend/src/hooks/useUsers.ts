'use client';

import { useQuery } from '@tanstack/react-query';
import { User } from '@/types';
import api from '@/lib/api';

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<User[]>('/users');
      return response.data;
    },
  });
};

