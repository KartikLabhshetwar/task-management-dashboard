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

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (newTask: Omit<Task, '_id'>) => {
    try {
      const response = await axios.post('/api/tasks', newTask, { headers: getAuthHeader() });
      setTasks(prevTasks => [...prevTasks, response.data]);
    } catch (err) {
      setError('Failed to add task');
      console.error(err);
    }
  }, []);

  const updateTask = useCallback(async (id: string, updatedFields: Partial<Task>) => {
    try {
      const response = await axios.put(`/api/tasks/${id}`, updatedFields, { headers: getAuthHeader() });
      setTasks(prevTasks => prevTasks.map(task => task._id === id ? { ...task, ...response.data } : task));
    } catch (err) {
      setError('Failed to update task');
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await axios.delete(`/api/tasks/${id}`, { headers: getAuthHeader() });
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
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
