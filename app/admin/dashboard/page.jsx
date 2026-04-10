'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Truck, Users } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useProducts, useOrders } from '@/lib/instantdbHooks'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const { products, isLoading: loadingProducts } = useProducts()
  const { orders, isLoading: loadingOrders } = useOrders()

  useEffect(() => {
    // Check if admin session exists (only on client side)
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('admin_session')
      if (session) {
        try {
          const parsed = JSON.parse(session)
          setUsername(parsed.username)
          setIsAdmin(true)
        } catch (err) {
        setIsAdmin(false)
      }
    }
    setLoading(false)
  }, [])

  // products are provided via `useProducts` hook

  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    toast.success('Logged out')
    router.push('/admin/login')
    router.refresh()
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              <span className="text-orange-600">Crave</span>Store Admin
            </h1>
            <p className="text-sm text-slate-500">Welcome, {username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Link
            href="/admin/products/create"
            className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Plus className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Create Product</h3>
                <p className="text-sm text-slate-500">Add new product to store</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/updates"
            className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plus className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Create Update</h3>
                <p className="text-sm text-slate-500">Festival announcements</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/dispatch"
            className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Truck className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Track Dispatch</h3>
                <p className="text-sm text-slate-500">Real-time rider tracking</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/riders"
            className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Manage Riders</h3>
                <p className="text-sm text-slate-500">Create rider codes</p>
              </div>
            </div>
          </Link>

          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm text-slate-600 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-slate-800">{loadingOrders ? '...' : orders.length}</p>
            <Link href="/admin/orders" className="text-sm text-orange-600 hover:text-orange-700 mt-2">View Orders →</Link>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Products</h2>
          {loadingProducts ? (
            <p className="text-slate-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-slate-500">No products yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between border p-3 rounded">
                  <div>
                    <h4 className="font-medium text-slate-800">{p.name}</h4>
                    <p className="text-sm text-slate-500">{p.category} • {process.env.NEXT_PUBLIC_CURRENCY_SYMBOL}{(p.price/100).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="px-3 py-1 bg-orange-600 text-white rounded">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
