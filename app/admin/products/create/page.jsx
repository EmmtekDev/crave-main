'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import db from '@/lib/instantdb'
import toast from 'react-hot-toast'
import { id } from '@instantdb/react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateProductPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    category: 'Electronics',
    image: '',
    in_stock: true,
  })

  useEffect(() => {
    // Check admin session (only on client side)
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('admin_session')
      if (session) {
        setIsAdmin(true)
      }
    }
    setLoading(false)
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result
        setForm(prev => ({ ...prev, image: base64 }))
        setImagePreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Insert product into Instant DB
      const productData = {
        name: form.name,
        description: form.description,
        price: Math.round(parseFloat(form.price) * 100), // Convert to kobo
        mrp: Math.round(parseFloat(form.mrp) * 100),
        category: form.category,
        images: form.image ? [form.image] : [],
        in_stock: form.in_stock,
        store_id: 'admin_store',
      }

      await db.transact(
        db.tx.products[id()].update(productData)
      ).catch(err => {
        if (err.message?.includes('closing')) {
          throw new Error('Database connection lost. Please try again.')
        }
        throw err
      })

      toast.success('Product created successfully!')
      setForm({
        name: '',
        description: '',
        price: '',
        mrp: '',
        category: 'Electronics',
        image: '',
        in_stock: true,
      })
      setImagePreview(null)
      router.push('/admin/dashboard')
    } catch (err) {
      toast.error('Error creating product: ' + err.message)
      console.error(err)
    } finally {
      setSubmitting(false)
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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Create New Product</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
          
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Modern Table Lamp"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the product..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Price and MRP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Selling Price (NGN) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g., 2900"
                step="100"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                MRP / Marked Price (NGN) *
              </label>
              <input
                type="number"
                name="mrp"
                value={form.mrp}
                onChange={handleChange}
                placeholder="e.g., 4000"
                step="100"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Electronics">Electronics</option>
              <option value="Decoration">Decoration</option>
              <option value="Watches">Watches</option>
              <option value="Speakers">Speakers</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-slate-600 mb-2">Preview:</p>
                <img src={imagePreview} alt="Preview" className="h-48 w-auto object-cover rounded-lg" />
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="in_stock"
              checked={form.in_stock}
              onChange={handleChange}
              className="w-4 h-4 accent-orange-600 rounded"
            />
            <label className="text-sm font-medium text-slate-700">
              In Stock
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {submitting ? 'Creating Product...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  )
}