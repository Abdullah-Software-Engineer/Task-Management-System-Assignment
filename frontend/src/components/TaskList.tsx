'use client';

import { Task, TaskStatus, TaskPriority } from '@/types';
import { format } from 'date-fns';
import clsx from 'clsx';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onUpdateTask: (id: string, data: any) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800',
  [TaskStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-gray-100 text-gray-800',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-800',
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onUpdateTask,
  onDeleteTask,
}) => {
  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    await onUpdateTask(task.id, { status: newStatus });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.length === 0 ? (
        <div className="col-span-full text-center py-8 text-gray-500">
          No tasks found. Create your first task!
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
              <div className="flex space-x-2">
                <span
                  className={clsx(
                    'px-2 py-1 text-xs font-medium rounded',
                    statusColors[task.status],
                  )}
                >
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
                <span
                  className={clsx(
                    'px-2 py-1 text-xs font-medium rounded',
                    priorityColors[task.priority],
                  )}
                >
                  {task.priority.toUpperCase()}
                </span>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {task.createdBy.firstName} {task.createdBy.lastName}
              </div>
              {task.assignedTo && (
                <div>
                  <span className="font-medium">Assigned to:</span>{' '}
                  {task.assignedTo.firstName} {task.assignedTo.lastName}
                </div>
              )}
              {task.dueDate && (
                <div>
                  <span className="font-medium">Due:</span>{' '}
                  {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                </div>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(task, e.target.value as TaskStatus)
                }
                onClick={(e) => e.stopPropagation()}
                className="flex-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={TaskStatus.TODO}>Todo</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.DONE}>Done</option>
                <option value={TaskStatus.CANCELLED}>Cancelled</option>
              </select>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

