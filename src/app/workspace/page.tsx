'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { FaListUl, FaColumns } from 'react-icons/fa'
import Navbar from '@/components/Navbar'
import {Button} from '@/components/ui/button'

export default function Workspace() {
  const router = useRouter()
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuth()

  useEffect(() => {
    const init = async () => {
      await checkAuthStatus();
      if (!isAuthenticated && !isLoading) {
        router.push('/auth/login')
      }
    };
    init();
  }, [isAuthenticated, isLoading, router, checkAuthStatus])

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Workspace</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="h-full cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaListUl className="mr-2" /> Task List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>View and manage your tasks in a list format. Filter, sort, and perform CRUD operations.</p>
                  <div className="mt-4">
                    <Button onClick={() => router.push('/dashboard')}>View Task List</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="h-full cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaColumns className="mr-2" /> Kanban Board
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Visualize your tasks in a Kanban board. Drag and drop tasks between different status columns.</p>
                  <div className="mt-4">
                    <Button onClick={() => router.push('/kanban')}>View Kanban Board</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}