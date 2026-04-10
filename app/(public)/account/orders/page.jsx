'use client'
import React, { useEffect, useState } from 'react'
import db from '@/lib/instantdb'
import { useUserOrders } from '@/lib/instantdbHooks'
import Link from 'next/link'

export default function OrdersPage() {
  const { user } = db.useAuth()
  const { orders, isLoading: ordersLoading } = useUserOrders(user?.id)

  if (ordersLoading) return <p>Loading...</p>
  if (!orders || orders.length === 0) return <p className="text-slate-500">No orders found.</p>

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
      <div className="flex flex-col gap-3">
        {orders.map(order => (
          <div key={order.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <p className="font-medium">Order: {order.id.slice(0, 8)}</p>
              <p className="text-sm text-slate-500">Total: ₦{((order.total || 0) / 100).toLocaleString()} • {order.status || 'pending'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/account/orders/${order.id}`} className="px-3 py-1 bg-slate-100 rounded">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
