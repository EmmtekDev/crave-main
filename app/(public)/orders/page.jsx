'use client'
import { useEffect, useState } from "react";
import db from '@/lib/instantdb'
import { useUserOrders } from '@/lib/instantdbHooks'
import Link from 'next/link'
import PageTitle from "@/components/PageTitle"

export default function Orders() {

    const { user } = db.useAuth()
    const { orders, isLoading: ordersLoading } = useUserOrders(user?.id)

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

    const getStatusSteps = (status) => {
        const steps = ['pending', 'sorting', 'shipped', 'delivered']
        return steps.indexOf(status || 'pending')
    }

    return (
        <div className="min-h-[70vh] mx-6">
            {ordersLoading ? (
                <div className="flex items-center justify-center py-20">
                    <p className="text-slate-500">Loading orders...</p>
                </div>
            ) : orders.length > 0 ? (
                <div className="my-20 max-w-7xl mx-auto">
                    <PageTitle heading="My Orders" text={`Showing total ${orders.length} orders`} linkText={'Go to home'} />

                    <div className="grid gap-6 mt-8">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow p-6 border border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Order ID</p>
                                        <p className="font-mono text-sm">{order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-2">Status</p>
                                        <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(order?.status || 'pending')}`}>
                                            {(order?.status || 'pending').replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs text-slate-600 mb-2">
                                        <span>Pending</span>
                                        <span>Sorting</span>
                                        <span>Shipped</span>
                                        <span>Delivered</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-orange-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(getStatusSteps(order?.status || 'pending') / 3) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Amount</p>
                                        <p className="text-lg font-semibold">₦{((order?.total || 0) / 100).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Payment Method</p>
                                        <p className="font-medium">{order?.paymentMethod || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Date</p>
                                        <p>{order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Paid</p>
                                        <p>{order?.isPaid ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                {order?.address && (
                                    <div className="mb-4 pb-4 border-b border-slate-200">
                                        <p className="text-sm text-slate-500 mb-2">Delivery Address</p>
                                        <div className="bg-slate-50 p-3 rounded text-sm">
                                            <p className="font-medium">{order.address?.name || ''}</p>
                                            <p>{order.address?.street || ''}</p>
                                            <p>{order.address?.city || ''}, {order.address?.state || ''} {order.address?.zip || ''}</p>
                                            <p>{order.address?.country || ''}</p>
                                            <p className="mt-2 text-xs">Phone: {order.address?.phone || ''}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                {Array.isArray(order?.items) && order.items.length > 0 && (
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
                </div>
            ) : (
                <div className="min-h-[80vh] flex items-center justify-center flex-col text-slate-400 gap-4">
                    <h1 className="text-2xl sm:text-4xl font-semibold">You have no orders</h1>
                    {!user && <p className="text-slate-600">
                        <Link href="/auth" className="text-orange-600 hover:text-orange-700">Log in</Link> to see your orders
                    </p>}
                </div>
            )}
        </div>
    )
}