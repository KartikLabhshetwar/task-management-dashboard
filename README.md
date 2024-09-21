# TaskMaster: Advanced Task Management Dashboard

## Overview

TaskMaster is a powerful, full-stack task management application built with Next.js, React, TypeScript, Express, Node, MongoDB. It features a dynamic Kanban board and a detailed task list view, offering users a comprehensive solution for organizing and tracking their tasks efficiently.

## Key Features

- **Interactive Kanban Board**: Drag-and-drop functionality for intuitive task management
- **Detailed Task List**: Sortable and filterable task view with priority highlighting
- **Real-time Updates**: Seamless task creation, updating, and deletion
- **Responsive Design**: Fully responsive layout for desktop and mobile devices
- **User Authentication**: Secure login and registration system

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **State Management**: React Context API
- **UI Components**: Customized Shadcn UI
- **Animations**: Framer Motion
- **Drag and Drop**: react-beautiful-dnd
- **Backend**: Node, Express, JWT.
- **Database**: MongoDB.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`) in your server folder.
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Code Highlights

- Efficient state management using React Context (see `src/context/TaskContext.tsx`)
- Custom hooks for task operations (see `src/hooks/useTasks.ts`)
- Responsive and animated UI components (see `src/components/ui/card.tsx`)
- Server-side rendering with Next.js for optimal performance

## Future Enhancements

- Implement collaborative features for team task management
- Integrate with calendar APIs for better scheduling
- Add data visualization for task completion trends

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
