"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import db from '@/lib/instantdb'
import toast from 'react-hot-toast'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', mrp: '', category: '', in_stock: true })
  const { isLoading: queryLoading, data } = db.useQuery({ products: {} })

  useEffect(() => {
    if (!id) return
    if (queryLoading) return
    const product = (data?.products || []).find(p => p.id === id)
    if (!product) {
      toast.error('Product not found')
      router.push('/admin/dashboard')
      return
    }
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: (product.price || 0) / 100,
      mrp: (product.mrp || 0) / 100,
      category: product.category || '',
      in_stock: product.in_stock === undefined ? true : product.in_stock,
    })
    setLoading(false)
  }, [id, router, queryLoading, data])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!id) return
    try {
      setSubmitting(true)
      const payload = {
        name: form.name,
        description: form.description,
        price: Math.round(parseFloat(form.price) * 100),
        mrp: Math.round(parseFloat(form.mrp) * 100),
        category: form.category,
        in_stock: form.in_stock,
      }
      await db.transact(db.tx.products[id].update(payload)).catch(err => {
        if (err.message?.includes('closing')) {
          throw new Error('Database connection lost. Please try again.')
        }
        throw err
      })
      toast.success('Product updated')
      router.push('/admin/dashboard')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update product')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Price (NGN)</label>
              <input name="price" value={form.price} onChange={handleChange} type="number" className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium">MRP (NGN)</label>
              <input name="mrp" value={form.mrp} onChange={handleChange} type="number" className="w-full border p-2 rounded" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <input name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="in_stock" checked={form.in_stock} onChange={handleChange} />
            <label>In Stock</label>
          </div>
          <button disabled={submitting} className="px-4 py-2 bg-orange-600 text-white rounded">{submitting ? 'Updating...' : 'Update Product'}</button>
        </form>
      </div>
    </div>
  )
}
