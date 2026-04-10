'use client'
import React, { useEffect, useState } from 'react'
import db from '@/lib/instantdb'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = db.useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      await db.auth.signOut()
      toast.success('Signed out')
    } catch (err) {
      toast.error('Error signing out')
    }
  }

  if (!user) return <p className="text-slate-500">Please sign in to view your profile.</p>

  return (
    <div className="bg-white p-6 rounded shadow-sm min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
      <p className="text-sm text-slate-500 mb-4">Email: <span className="font-medium">{user.email}</span></p>
      <p className="text-sm text-slate-500 mb-6">User ID: <span className="font-medium text-xs font-mono">{user.id}</span></p>
      <div className="flex gap-2">
        <a href="/account/orders" className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">View Orders</a>
        <button onClick={handleSignOut} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Sign Out</button>
      </div>
    </div>
  )
}
