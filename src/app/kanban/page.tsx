'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTaskContext } from '@/context/TaskContext'
import Navbar from '@/components/Navbar'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TaskForm from '@/components/TaskForm'
import { useTasks } from '@/hooks/useTasks'
import Link from 'next/link'

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
}

type Column = {
  title: string;
  items: Task[];
};

type Columns = {
  [key: string]: Column;
};

type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

export default function Kanban() {
  const pathname = usePathname();
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { tasks, loading, error, fetchTasks, showToast } = useTaskContext();
  const { moveTask } = useTasks();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [columns, setColumns] = useState<Columns>({
    'To Do': { title: 'To Do', items: [] },
    'In Progress': { title: 'In Progress', items: [] },
    'Completed': { title: 'Completed', items: [] }
  });

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

  useEffect(() => {
    if (tasks.length > 0) {
      const newColumns: Columns = {
        'To Do': { title: 'To Do', items: [] },
        'In Progress': { title: 'In Progress', items: [] },
        'Completed': { title: 'Completed', items: [] }
      };
      tasks.forEach(task => {
        if (newColumns[task.status]) {
          newColumns[task.status].items.push(task);
        }
      });
      setColumns(newColumns);
    }
  }, [tasks]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      const newColumns = {
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      };
      
      setColumns(newColumns);

      // Update the task status in the backend
      await moveTask(removed._id, destination.droppableId as TaskStatus);
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      const newColumns = {
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      };
      
      setColumns(newColumns);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen loading-page">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
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
          <h1 className="text-3xl font-bold text-black">Kanban Board</h1>
          <div className="space-x-2">
            <Button onClick={() => setIsAddingTask(true)}>Add New Task</Button>
            <Button onClick={() => router.push('/dashboard')}>View Task List</Button>
          </div>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(columns).map(([columnId, column]) => (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided) => (
                  <Card {...provided.droppableProps} ref={provided.innerRef} className="min-h-[200px]">
                    <CardHeader>
                      <CardTitle>{column.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {column.items.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`card p-3 mb-2 rounded-lg ${
                                task.status === 'To Do'
                                  ? 'card-todo'
                                  : task.status === 'In Progress'
                                  ? 'card-in-progress'
                                  : 'card-completed'
                              } ${snapshot.isDragging ? 'shadow-2xl rotate-3' : ''}`}
                            >
                              <h3 className="font-bold text-gray-800">{task.title}</h3>
                              <p className={`text-sm ${
                                task.priority === 'High' 
                                  ? 'text-red-600' 
                                  : task.priority === 'Medium' 
                                    ? 'text-yellow-600' 
                                    : 'text-green-600'
                              }`}>
                                Priority: {task.priority}
                              </p>
                              <p className="text-sm text-gray-600">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </CardContent>
                  </Card>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </main>
      {isAddingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Task</h2>
            <TaskForm
              onSubmit={async () => {
                setIsAddingTask(false);
                await fetchTasks();
                showToast('Task created successfully', 'success');
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