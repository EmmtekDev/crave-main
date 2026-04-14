'use client'
import React, { useEffect, useState } from 'react'
import db from '@/lib/instantdb'
import { useUserOrders, useUserDeliveries } from '@/lib/instantdbHooks'
import Link from 'next/link'
import { Truck, ShoppingCart } from 'lucide-react'

export default function OrdersPage() {
  const { user } = db.useAuth()
  const { orders, isLoading: ordersLoading } = useUserOrders(user?.id)
  const { deliveries, isLoading: deliveriesLoading } = useUserDeliveries(user?.id)
  const [activeTab, setActiveTab] = useState('orders')

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  if (ordersLoading || deliveriesLoading) return <p>Loading...</p>

  const hasOrders = orders && orders.length > 0
  const hasDeliveries = deliveries && deliveries.length > 0

  if (!hasOrders && !hasDeliveries) {
    return (
      <div className="bg-white p-8 rounded shadow-sm text-center">
        <p className="text-slate-500 text-lg">No orders or deliveries found.</p>
        <Link href="/shop" className="inline-block mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 flex">
        {hasOrders && (
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition ${
              activeTab === 'orders'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            <ShoppingCart size={18} />
            Orders {hasOrders && <span className="text-sm">({orders.length})</span>}
          </button>
        )}
        {hasDeliveries && (
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition ${
              activeTab === 'deliveries'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            <Truck size={18} />
            Deliveries {hasDeliveries && <span className="text-sm">({deliveries.length})</span>}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
            <div className="flex flex-col gap-3">
              {orders.map(order => (
                <div key={order.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-800">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-3">{order.items?.length || 0} items • {currency}{((order.total || 0) / 100).toFixed(2)}</p>
                  <Link href={`/account/orders/${order.id}`} className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Deliveries</h2>
            <div className="flex flex-col gap-3">
              {deliveries.map(delivery => (
                <div key={delivery.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-800 font-mono">{delivery.trackingNumber}</p>
                      <p className="text-sm text-slate-600">{new Date(delivery.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      delivery.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : delivery.status?.includes('delivery')
                        ? 'bg-blue-100 text-blue-700'
                        : delivery.status?.includes('picked')
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {delivery.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-2">
                    <span className="font-medium">{delivery.packageType}</span> • {delivery.packageWeight} kg
                  </p>
                  <p className="text-sm text-slate-600 mb-3">
                    From: {delivery.senderCity}, {delivery.senderState} → To: {delivery.recipientCity}, {delivery.recipientState}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-800">{currency}{(delivery.totalPrice / 100).toFixed(2)}</p>
                    <Link href={`/delivery/${delivery.trackingNumber}`} className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                      Track Delivery →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
