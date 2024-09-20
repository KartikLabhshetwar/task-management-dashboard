import Task from "../models/taskModel";
import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';

interface TaskQuery {
    user: string;
    status?: string;
    priority?: string;
    dueDate?: { $lte: Date };
}

// Update all function signatures to use Request instead of AuthenticatedRequest
export const createTask = async (req: Request, res: Response) => {
    try {
        const task = new Task ({
            user: req.user._id,
            ...req.body,
        });
        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (e: unknown) {
        res.status(500).json({ message: e instanceof Error ? e.message : 'An unknown error occurred' });
    }
};

// Do the same for getTasks, updateTask, and deleteTask
export const getTasks = async (req: Request, res: Response) => {
    try {
        const query: TaskQuery = { user: req.user._id };
        const sort: { [key: string]: SortOrder } = {};

        if (typeof req.query.status === 'string') {
            query.status = req.query.status;
        }
        if (typeof req.query.priority === 'string') {
            query.priority = req.query.priority;
        }
        if (req.query.dueDate && typeof req.query.dueDate === 'string') {
            query.dueDate = { $lte: new Date(req.query.dueDate) };
        }

        if (typeof req.query.sortBy === 'string') {
            const [sortField, sortOrder] = req.query.sortBy.split(':');
            sort[sortField] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const tasks = await Task.find(query).sort(sort);
        res.json(tasks);
    } catch (error: unknown) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
}

export const updateTask = async (req: Request, res: Response) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTask);
    } catch (error: unknown) {
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const task = await Task.findById(req.params.id);
        if (task && task.user.toString() === req.user._id.toString()) {
            await task.deleteOne({ _id: req.params.id });
            res.json({ message: "Task removed." });
        } else {
            res.status(404).json({ message: "Task not found." })
        }
    } catch (error: unknown) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
}