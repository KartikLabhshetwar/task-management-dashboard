import { useTaskContext } from '@/context/TaskContext';
import { Task } from '@/context/TaskContext';

export const useTasks = () => {
  const { tasks, addTask, updateTask, deleteTask, fetchTasks } = useTaskContext();

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const moveTask = async (taskId: string, newStatus: 'To Do' | 'In Progress' | 'Completed') => {
    await updateTask(taskId, { status: newStatus });
  };

  const sortTasks = (field: keyof Task, order: 'asc' | 'desc') => {
    return [...tasks].sort((a, b) => {
      if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterTasks = (filters: Partial<Task>) => {
    return tasks.filter(task => 
      Object.entries(filters).every(([key, value]) => 
        task[key as keyof Task] === value
      )
    );
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    fetchTasks,
    getTasksByStatus,
    moveTask,
    sortTasks,
    filterTasks
  };
};
