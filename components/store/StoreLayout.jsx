'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import db from '@/lib/instantdb'

const StoreLayout = ({ children }) => {
  const router = useRouter()
  const { user } = db.useAuth()

  useEffect(() => {
    // Check if user is authenticated as a store owner
    if (!user) {
      router.push('/auth')
    }
  }, [user, router])

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}

export default StoreLayout
