import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
    },
    description: { type: String},
    status: {
        type: String,
        required: true,
        enum: ["To Do", "In Progress", "Completed"],
        default: "To Do",
    },
    priority: {
        type: String,
        required: true,
        enum: ["Low", "Medium", "High"],
        default: "Medium",
    },
    dueDate: {
        type: Date,
    }
}, {timestamps: true});

const Task = mongoose.model("Task", taskSchema);

export default Task;