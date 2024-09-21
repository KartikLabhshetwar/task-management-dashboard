'use client'

import { useAuth } from '@/context/AuthContext'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const { user, logout, showToast } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed', error)
      showToast('Logout failed', 'error')
    }
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/workspace" className="text-2xl font-bold text-gray-800">
              TaskMaster
            </Link>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 mr-4">Welcome, {user?.name || 'User'}</span>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
