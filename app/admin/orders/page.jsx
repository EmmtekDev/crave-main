'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrders } from '@/lib/instantdbHooks'
import db from '@/lib/instantdb'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import MapTracking from '@/components/MapTracking'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const { orders, isLoading: ordersLoading } = useOrders()

  useEffect(() => {
    // Check if admin session exists (only on client side)
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('admin_session')
      if (session) {
        try {
          JSON.parse(session)
          setIsAdmin(true)
        } catch (err) {
          setIsAdmin(false)
        }
      }
    }
    setLoading(false)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-700'
      case 'sorting':
        return 'bg-yellow-100 text-yellow-700'
      case 'shipped':
        return 'bg-purple-100 text-purple-700'
      case 'delivered':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId)
      await db.transact(db.tx.orders[orderId].update({ status: newStatus })).catch(err => {
        if (err.message?.includes('closing')) {
          throw new Error('Connection lost. Please refresh and try again.')
        }
        throw err
      })
      toast.promise(
        Promise.resolve(),
        {
          success: 'Order status updated',
          loading: 'Updating order status...',
          error: 'Failed to update order status'
        }
      )
    } catch (err) {
      console.error(err)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Unauthorized</h1>
          <p className="text-slate-600 mb-6">Please log in as admin first</p>
          <Link href="/admin/login" className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Go to Admin Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-slate-600 hover:text-slate-800">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">
              <span className="text-orange-600">Orders</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {ordersLoading ? (
          <p className="text-slate-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-slate-500">No orders yet.</p>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6 border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Order ID</p>
                    <p className="font-mono text-sm">{order.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={order?.status || 'pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingOrderId === order.id}
                      className={`px-3 py-1 rounded text-sm font-medium border ${getStatusColor(order?.status || 'pending')} outline-none cursor-pointer`}
                    >
                      <option value="pending">Pending</option>
                      <option value="sorting">Sorting</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-lg font-semibold">₦{((order?.total || 0) / 100).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Payment Method</p>
                    <p className="font-medium">{order.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Date</p>
                    <p>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Paid</p>
                    <p>{order.isPaid ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Customer Address */}
                {order.address && (
                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <p className="text-sm text-slate-500 mb-2">Delivery Address</p>
                    <div className="bg-slate-50 p-3 rounded text-sm">
                      <p className="font-medium">{order.address.name}</p>
                      <p>{order.address.street}</p>
                      <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                      <p>{order.address.country}</p>
                      <p className="mt-2">Phone: {order.address.phone}</p>
                    </div>
                  </div>
                )}

                {/* Tracking Map */}
                {order.address && order.address.lat && order.address.lng && (
                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <p className="text-sm text-slate-500 mb-2">Order Tracking Map</p>
                    <MapTracking 
                      orderAddress={order.address} 
                      orderStatus={order.status || 'pending'}
                      editable={true}
                    />
                  </div>
                )}

                {/* Order Items */}
                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Items</p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm bg-slate-50 p-2 rounded">
                          <div>
                            <p className="font-medium">{item.name || 'Product'}</p>
                            <p className="text-slate-500">Qty: {item.quantity || 0}</p>
                          </div>
                          <p className="font-medium">₦{(((item.price || 0) / 100) * (item.quantity || 0)).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
