'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTaskContext } from '@/context/TaskContext'
import { Task } from '@/context/TaskContext'
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"


type TaskFormProps = {
  task?: Task
  onSubmit: () => void
  onCancel: () => void
  showToast: (message: string, type: 'success' | 'error') => void
}

export default function TaskForm({ task, onSubmit, onCancel, showToast }: TaskFormProps) {
  const { addTask, updateTask } = useTaskContext()
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<'To Do' | 'In Progress' | 'Completed'>(task?.status || 'To Do')
  const [priority, setPriority] = useState(task?.priority || 'Medium')
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const taskData = { 
      title, 
      description, 
      status, 
      priority, 
      dueDate: dueDate ? dueDate.toISOString() : undefined
    }
    try {
      if (task?._id) {
        await updateTask(task._id, taskData)
        showToast('Task updated successfully', 'success')
      } else {
        await addTask({
          ...taskData,
          dueDate: taskData.dueDate || ''
        });
      }
      onSubmit()
    } catch (error) {
      console.error('Error submitting task:', error)
      showToast('Error creating/updating task', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-700">Title</Label>
        <Input
          id="title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="text-gray-800"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="text-gray-800"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value: 'To Do' | 'In Progress' | 'Completed') => setStatus(value)}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={(value: "Low" | "Medium" | "High") => setPriority(value)}>
          <SelectTrigger id="priority">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate" className="text-gray-700">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-full justify-start text-left font-normal ${!dueDate ? "text-gray-500" : "text-gray-800"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} className="text-gray-800">Cancel</Button>
        <Button type="submit" className="text-white bg-blue-600 hover:bg-blue-700">{task?._id ? 'Update' : 'Create'} Task</Button>
      </div>
    </form>
  )
}
