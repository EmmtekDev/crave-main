'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import db from '@/lib/instantdb'
import { useDeliveries } from '@/lib/instantdbHooks'
import toast from 'react-hot-toast'
import { ArrowLeft, TrendingUp, Truck, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AdminLogisticsPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState(null)
  const { deliveries, isLoading: deliveriesLoading } = useDeliveries()

  useEffect(() => {
    // Check if admin session exists
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

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'pickup_scheduled', label: 'Scheduled', color: 'blue' },
    { value: 'picked_up', label: 'Picked Up', color: 'blue' },
    { value: 'in_transit', label: 'In Transit', color: 'purple' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'orange' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'pickup_scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'picked_up':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'in_transit':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300'
    }
  }

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      setUpdatingDeliveryId(deliveryId)
      await db.transact(db.tx.deliveries[deliveryId].update({ status: newStatus })).catch((err) => {
        if (err.message?.includes('closing')) {
          throw new Error('Connection lost. Please refresh and try again.')
        }
        throw err
      })
      toast.success('Delivery status updated')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update delivery status')
    } finally {
      setUpdatingDeliveryId(null)
    }
  }

  const filteredDeliveries = filterStatus === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.status === filterStatus)

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    inTransit: deliveries.filter(d => ['picked_up', 'in_transit', 'out_for_delivery'].includes(d.status)).length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
  }

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

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
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/dashboard" className="text-slate-600 hover:text-slate-800">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">
              <span className="text-orange-600">Logistics</span> Management
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-200 rounded-lg">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Total Deliveries</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-200 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-200 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-700">In Transit</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.inTransit}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Delivered</p>
                  <p className="text-2xl font-bold text-green-900">{stats.delivered}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All Deliveries' },
            ...statuses.slice(0, 6), // Show top statuses
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filterStatus === status.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {deliveriesLoading ? (
          <p className="text-slate-500">Loading deliveries...</p>
        ) : filteredDeliveries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No deliveries found.</p>
            {filterStatus !== 'all' && (
              <p className="text-slate-400">Try selecting a different status.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden hover:shadow-md transition">
                {/* Top section */}
                <div className="p-6 border-b border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-slate-500">Tracking Number</p>
                      <p className="font-mono text-lg font-semibold text-orange-600">{delivery.trackingNumber}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        From: <span className="font-medium">{delivery.senderName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Total Cost</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {currency}{(delivery.totalPrice / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="flex items-center gap-4">
                    <select
                      value={delivery.status || 'pending'}
                      onChange={(e) => handleStatusChange(delivery.id, e.target.value)}
                      disabled={updatingDeliveryId === delivery.id}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border outline-none cursor-pointer ${getStatusColor(delivery.status || 'pending')}`}
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Details section */}
                <div className="px-6 py-4 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Pickup Date</p>
                      <p className="text-sm font-medium text-slate-800">
                        {new Date(delivery.pickupDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Vehicle Type</p>
                      <p className="text-sm font-medium text-slate-800 capitalize">{delivery.vehicleType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Weight</p>
                      <p className="text-sm font-medium text-slate-800">{delivery.packageWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Est. Delivery</p>
                      <p className="text-sm font-medium text-slate-800">
                        {new Date(delivery.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold mb-1 flex items-center">
                        📍 Pickup Location
                      </p>
                      <p className="text-sm text-slate-700">
                        {delivery.senderAddress}, {delivery.senderCity}, {delivery.senderState}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">{delivery.senderPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold mb-1 flex items-center">
                        📍 Delivery Location
                      </p>
                      <p className="text-sm text-slate-700">
                        {delivery.recipientAddress}, {delivery.recipientCity}, {delivery.recipientState}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">{delivery.recipientPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Package details */}
                {delivery.packageDescription && (
                  <div className="px-6 py-3 border-t border-slate-200 bg-white">
                    <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Package Description</p>
                    <p className="text-sm text-slate-700">{delivery.packageDescription}</p>
                  </div>
                )}

                {/* Payment Method */}
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Payment Method</p>
                    <p className="text-sm font-medium">
                      {delivery.paymentMethod === 'COD' ? '💵 Cash On Delivery' : '💳 Pay Online'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    delivery.paymentMethod === 'COD'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {delivery.paymentMethod === 'COD' ? 'COD' : 'Online'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
