'use client'
import React, { useEffect, useState } from 'react'
import db from '@/lib/instantdb'
import { useOrders } from '@/lib/instantdbHooks'
import { useParams } from 'next/navigation'
import MapTracking from '@/components/MapTracking'

export default function OrderDetail() {
  const params = useParams()
  const orderId = params?.orderId
  const { orders } = useOrders()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const foundOrder = orders.find(o => o.id === orderId)
      setOrder(foundOrder || null)
      setLoading(false)
    }
  }, [orderId, orders])

  if (loading) return <p>Loading...</p>
  if (!order) return <p className="text-slate-500">Order not found.</p>

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Order {order.id.slice(0, 8)}</h2>
      <p className="text-sm text-slate-500 mb-4">Status: <span className="font-medium">{order.status || 'pending'}</span></p>

      {/* Map Tracking */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Delivery Tracking</h3>
        {order.address && order.address.lat && order.address.lng ? (
          <MapTracking 
            orderAddress={order.address} 
            orderStatus={order.status || 'pending'}
            editable={false}
          />
        ) : (
          <div className="p-4 bg-gray-100 rounded text-gray-600 text-sm">
            Location data not available for this order
          </div>
        )}
      </div>

      <div className="space-y-3">
        {(order.items || []).map((it, idx) => (
          <div key={idx} className="flex items-center gap-4 p-3 border rounded">
            <div>
              <p className="font-medium">{it.name || 'Product'}</p>
              <p className="text-sm text-slate-500">Qty: {it.quantity} • ₦{(((it.price || 0) / 100) * (it.quantity || 0)).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="font-medium">Total: ₦{((order.total || 0) / 100).toLocaleString()}</p>
      </div>
    </div>
  )
}
