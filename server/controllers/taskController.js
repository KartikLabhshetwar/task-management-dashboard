import Task from '../models/taskModel.js';

const createTask = async (req, res) => {
    try {
        const task = new Task ({
            user: req.user._id,
            ...req.body,
        });
        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (e) {
        res.status(500).json({ message: e.message || 'An unknown error occurred' });
    }
};

const getTasks = async (req, res) => {
    try {
        const query = { user: req.user._id };
        const sort = {};

        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.priority) {
            query.priority = req.query.priority;
        }
        if (req.query.dueDate) {
            query.dueDate = { $lte: new Date(req.query.dueDate) };
        }

        if (req.query.sortBy) {
            const [sortField, sortOrder] = req.query.sortBy.split(':');
            sort[sortField] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const tasks = await Task.find(query).sort(sort);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message || 'An unknown error occurred' });
    }
};

const updateTask = async (req, res) => {
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
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (task && task.user.toString() === req.user._id.toString()) {
            await task.deleteOne({ _id: req.params.id });
            res.json({ message: "Task removed." });
        } else {
            res.status(404).json({ message: "Task not found." })
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { createTask, getTasks, updateTask, deleteTask };
