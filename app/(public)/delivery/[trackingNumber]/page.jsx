'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import db from '@/lib/instantdb'
import { useDeliveryByTracking } from '@/lib/instantdbHooks'
import { MapPin, Package, Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function DeliveryTrackingPage() {
  const params = useParams()
  const trackingNumber = params.trackingNumber
  const { delivery, isLoading } = useDeliveryByTracking(trackingNumber)

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  const statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: '📦', color: 'yellow' },
    { status: 'pickup_scheduled', label: 'Pickup Scheduled', icon: '📋', color: 'blue' },
    { status: 'picked_up', label: 'Picked Up', icon: '📤', color: 'blue' },
    { status: 'in_transit', label: 'In Transit', icon: '🚚', color: 'purple' },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🚗', color: 'orange' },
    { status: 'delivered', label: 'Delivered', icon: '✓', color: 'green' },
  ]

  const getStatusIndex = (status) => {
    return statusSteps.findIndex(s => s.status === status)
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading delivery details...</p>
        </div>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Delivery Not Found</h1>
            <p className="text-slate-600 mb-6">
              We couldn't find a delivery with tracking number: <strong>{trackingNumber}</strong>
            </p>
            <Link
              href="/delivery"
              className="inline-block px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
            >
              Create New Delivery
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentStatusIndex = getStatusIndex(delivery.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Track Your Delivery</h1>
          <p className="text-slate-600">
            Tracking #: <span className="font-mono text-orange-600 font-semibold">{delivery.trackingNumber}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className={`rounded-xl shadow-lg p-8 border-2 ${getStatusColor(delivery.status)}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">
                  {statusSteps.find(s => s.status === delivery.status)?.icon}
                </div>
                <div>
                  <p className="text-sm opacity-75">Current Status</p>
                  <h2 className="text-2xl font-bold">
                    {statusSteps.find(s => s.status === delivery.status)?.label}
                  </h2>
                </div>
              </div>
              {delivery.status === 'delivered' && (
                <p className="text-sm mt-2">✓ Your package has been successfully delivered</p>
              )}
            </div>

            {/* Timeline Progress */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Delivery Progress</h3>
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex
                  const isCurrent = index === currentStatusIndex

                  return (
                    <div key={step.status} className="flex gap-4">
                      {/* Timeline marker */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isCompleted
                              ? 'bg-orange-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`w-1 h-12 ${
                              isCompleted ? 'bg-orange-600' : 'bg-slate-200'
                            }`}
                          />
                        )}
                      </div>

                      {/* Step content */}
                      <div className="pb-6">
                        <p
                          className={`font-semibold ${
                            isCompleted ? 'text-slate-800' : 'text-slate-500'
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-orange-600 font-medium">Currently here</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sender & Recipient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sender */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                  From
                </h3>
                <p className="font-medium text-slate-800">{delivery.senderName}</p>
                <p className="text-sm text-slate-600">{delivery.senderPhone}</p>
                <p className="text-sm text-slate-600 mt-2">{delivery.senderAddress}</p>
                <p className="text-sm text-slate-600">
                  {delivery.senderCity}, {delivery.senderState}
                </p>
              </div>

              {/* Recipient */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-red-600" />
                  To
                </h3>
                <p className="font-medium text-slate-800">{delivery.recipientName}</p>
                <p className="text-sm text-slate-600">{delivery.recipientPhone}</p>
                <p className="text-sm text-slate-600 mt-2">{delivery.recipientAddress}</p>
                <p className="text-sm text-slate-600">
                  {delivery.recipientCity}, {delivery.recipientState}
                </p>
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Package Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Type</p>
                  <p className="font-medium text-slate-800 capitalize">{delivery.packageType}</p>
                </div>
                <div>
                  <p className="text-slate-600">Weight</p>
                  <p className="font-medium text-slate-800">{delivery.packageWeight} kg</p>
                </div>
                <div>
                  <p className="text-slate-600">Vehicle</p>
                  <p className="font-medium text-slate-800">{delivery.vehicleType}</p>
                </div>
                <div>
                  <p className="text-slate-600">Pickup Date</p>
                  <p className="font-medium text-slate-800">
                    {new Date(delivery.pickupDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Est. Delivery</p>
                  <p className="font-medium text-slate-800">
                    {new Date(delivery.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Order Date</p>
                  <p className="font-medium text-slate-800">
                    {new Date(delivery.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {delivery.packageDescription && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-slate-600 text-sm">Description</p>
                  <p className="text-slate-800">{delivery.packageDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <span className="text-xl mr-2">💰</span>
                Cost Summary
              </h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Fee</span>
                  <span className="font-medium">{currency}{(delivery.baseFee / 100).toLocaleString()}</span>
                </div>
                {delivery.weightFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Weight</span>
                    <span className="font-medium">{currency}{(delivery.weightFee / 100).toLocaleString()}</span>
                  </div>
                )}
                {delivery.handlingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Handling</span>
                    <span className="font-medium">{currency}{(delivery.handlingFee / 100).toLocaleString()}</span>
                  </div>
                )}
                {delivery.insuranceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Insurance</span>
                    <span className="font-medium">{currency}{(delivery.insuranceFee / 100).toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {currency}{(delivery.totalPrice / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-bold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-4">
                Contact our support team if you have any questions about your delivery.
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition">
                Contact Support
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/delivery"
                className="block w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium text-center transition"
              >
                Create Another
              </Link>
              <Link
                href="/"
                className="block w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium text-center hover:bg-slate-50 transition"
              >
                Back Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
