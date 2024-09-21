'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTaskContext } from '@/context/TaskContext'
import Navbar from '@/components/Navbar'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from '@/context/TaskContext'
import TaskForm from '@/components/TaskForm'
import Link from 'next/link'

export default function Dashboard() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { tasks, loading, error, fetchTasks, showToast, updateTask, deleteTask } = useTaskContext();
  const [sortField, setSortField] = useState<keyof Task>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated && !isLoading) {
        router.push('/auth/login');
      } else if (isAuthenticated && !isLoading) {
        fetchTasks();
      }
    };
    init();
  }, [isAuthenticated, isLoading, router, fetchTasks]);

  const handleSort = (field: keyof Task) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilter = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value === 'all' ? '' : value });
  };

  const filteredAndSortedTasks = tasks
    ? tasks
        .filter((task: Task) => 
          (!filters.status || task.status === filters.status) &&
          (!filters.priority || task.priority === filters.priority) &&
          (!filters.search || task.title.toLowerCase().includes(filters.search.toLowerCase()))
        )
        .sort((a: Task, b: Task) => {
          if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
          if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        })
    : [];

  if (!isAuthenticated) {
    return null // or a loading spinner
  }

  if (loading) return <div className="flex justify-center items-center h-screen loading-page text-black">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen loading-page text-black">Error: {error}</div>;


  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className='flex justify-between items-center mb-4 mt-6'>
      {pathname !== '/workspace' && (
                <Link href="/workspace" className="ml-4 text-gray-600 hover:text-gray-800">

                  Back to Workspace
                </Link>
              )}
      </div>
       
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Task List</h1>
          <div className="space-x-2">
            <Button onClick={() => setIsAddingTask(true)}>Add New Task</Button>
            <Button onClick={() => router.push('/kanban')}>View Kanban Board</Button>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 ">
          <Select onValueChange={(value) => handleFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" className="text-gray-800" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleFilter('priority', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" className="text-gray-800" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            placeholder="Search tasks..." 
            onChange={(e) => handleFilter('search', e.target.value)}
            className="w-full text-gray-800"
          />
        </div>
        <div className="mb-6 flex justify-center space-x-2">
          <Button onClick={() => handleSort('title')}>
            Sort by Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button onClick={() => handleSort('dueDate')}>
            Sort by Due Date {sortField === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button onClick={() => handleSort('priority')}>
            Sort by Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredAndSortedTasks.length > 0 ? (
              filteredAndSortedTasks.map((task: Task) => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle>{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="mb-2">{task.description}</p>
                      <p className="mb-1">Status: <span className={`font-semibold ${task.status === 'Completed' ? 'text-green-500' : task.status === 'In Progress' ? 'text-yellow-500' : 'text-red-500'}`}>{task.status}</span></p>
                      <p className="mb-1">Priority: <span className={`font-semibold ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>{task.priority}</span></p>
                      <p className="mb-4">Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
                      <div className="flex justify-between">
                        <Button onClick={() => updateTask(task._id, { status: task.status === 'To Do' ? 'In Progress' : 'Completed' })}>
                          Move to {task.status === 'To Do' ? 'In Progress' : 'Completed'}
                        </Button>
                        <Button variant="destructive" onClick={() => deleteTask(task._id)}>Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <p>No tasks found.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      {isAddingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Task</h2>
            <TaskForm
              onSubmit={() => {
                setIsAddingTask(false);
                showToast('Task created successfully', 'success');
                // Optionally, you can refresh the task list here
              }}
              onCancel={() => setIsAddingTask(false)}
              showToast={showToast}
            />
          </div>
        </div>
      )}
    </div>
  )
}