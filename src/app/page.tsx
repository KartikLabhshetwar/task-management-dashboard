'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/workspace')
      } else {
        router.push('/auth/signup')
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="text-black text-4xl font-bold mb-8">
          TaskMaster
        </div>
        <div className="w-16 h-16 border-t-4 border-black border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-black text-xl">
          Loading your workspace...
        </p>
      </div>
    )
  }

  return null
}
