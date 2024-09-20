'use client';

import { TaskProvider } from '@/context/TaskContext';
import '@/app/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
            <TaskProvider>
              {children}
            </TaskProvider>
            <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}