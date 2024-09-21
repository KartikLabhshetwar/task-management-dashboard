'use client';

import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export type Task = {
  _id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
};

export type TaskContextType = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, '_id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  fetchTasks: () => Promise<void>;
  showToast: (message: string, type: 'success' | 'error') => void;
};

const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(`Failed to fetch tasks: ${err.response.data.message || err.message}`);
      } else {
        setError('Failed to fetch tasks');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (newTask: Omit<Task, '_id'>) => {
    try {
      const response = await axios.post('/api/tasks', newTask, {
        headers: getAuthHeader()
      });
      setTasks(prevTasks => [...prevTasks, response.data]);
    } catch (err) {
      setError('Failed to add task');
      console.error(err);
    }
  }, [getAuthHeader]);

  const updateTask = useCallback(async (id: string, updatedFields: Partial<Task>) => {
    try {
      const response = await axios.put(`/api/tasks/${id}`, updatedFields, {
        headers: getAuthHeader()
      });
      setTasks(prevTasks => prevTasks.map(task => task._id === id ? { ...task, ...response.data } : task));
    } catch (err) {
      setError('Failed to update task');
      throw err;
    }
  }, [getAuthHeader]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      showToast('Task deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task. Please try again.', 'error');
      
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const showToast = (message: string, type: 'success' | 'error') => {
    toast[type](message);
  };

  const value = useMemo(() => ({
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    showToast,
  }), [tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
