'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { TaskModal } from './TaskModal';
import { format } from 'date-fns';

export const DashboardContent: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: tasks, isLoading, refetch } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const handleTaskUpdate = useCallback((event: any) => {
    console.log('Task update received:', event);
    refetch();
  }, [refetch]);

  useWebSocket(token, handleTaskUpdate);

  const filteredTasks = tasks?.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  }) || [];

  const handleCreateTask = async (taskData: any) => {
    await createTask.mutateAsync(taskData);
    setShowCreateModal(false);
  };

  const handleUpdateTask = async (id: string, taskData: any) => {
    await updateTask.mutateAsync({ id, data: taskData });
    setSelectedTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Task Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Task
            </button>
          </div>

          <div className="mb-4 flex space-x-2">
            {(['all', TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onTaskClick={setSelectedTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {showCreateModal && (
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowCreateModal(false)}
            />
          )}

          {selectedTask && (
            <TaskModal
              task={selectedTask}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onClose={() => setSelectedTask(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

