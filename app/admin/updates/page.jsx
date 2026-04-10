'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import db from '@/lib/instantdb'
import { useUpdates } from '@/lib/instantdbHooks'
import { id } from '@instantdb/react'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'

const NIGERIA_FESTIVALS = [
  'New Year\'s Day',
  'Democracy Day (June 12)',
  'Independence Day (October 1)',
  'Christmas',
  'Eid al-Fitr',
  'Eid al-Adha',
  'Durbar Festival',
  'Calabar Carnival',
  'Osun Osogbo Festival',
  'Argungu Fishing Festival',
  'Eyo Festival',
  'Sallah Festival',
  'General Announcement'
]

const RIBBON_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
]

export default function AdminUpdatesPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    message: '',
    festival: 'General Announcement',
    ribbonColor: '#ef4444',
    image: '',
    isActive: true,
  })

  const { updates, isLoading: updatesLoading } = useUpdates()

  useEffect(() => {
    // Check if admin session exists (only on client side)
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
    try {
      setSubmitting(true)

      if (editingId) {
        await db.transact(db.tx.updates[editingId].update({
          title: form.title,
          message: form.message,
          festival: form.festival,
          ribbonColor: form.ribbonColor,
          image: form.image,
          isActive: form.isActive,
          updatedAt: new Date().toISOString(),
        })).catch(err => {
          if (err.message?.includes('closing')) {
            toast.error('Database connection issue. Please try again.')
            throw err
          }
          throw err
        })
        toast.success('Update modified successfully')
      } else {
        const updateId = id()
        await db.transact(db.tx.updates[updateId].update({
          id: updateId,
          title: form.title,
          message: form.message,
          festival: form.festival,
          ribbonColor: form.ribbonColor,
          image: form.image,
          isActive: form.isActive,
          createdAt: new Date().toISOString(),
        })).catch(err => {
          if (err.message?.includes('closing')) {
            toast.error('Database connection issue. Please try again.')
            throw err
          }
          throw err
        })
        toast.success('Update created successfully')
      }

      setForm({
        title: '',
        message: '',
        festival: 'General Announcement',
        ribbonColor: '#ef4444',
        image: '',
        isActive: true,
      })
      setImagePreview(null)
      setShowForm(false)
      setEditingId(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to save update')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (update) => {
    setForm({
      title: update.title,
      message: update.message,
      festival: update.festival || 'General Announcement',
      ribbonColor: update.ribbonColor || '#ef4444',
      image: update.image || '',
      isActive: update.isActive !== false,
    })
    setImagePreview(update.image)
    setEditingId(update.id)
    setShowForm(true)
  }

  const handleDelete = async (updateId) => {
    if (!confirm('Delete this update?')) return
    try {
      await db.transact(db.tx.updates[updateId].delete()).catch(err => {
        if (err.message?.includes('closing')) {
          throw new Error('Connection lost. Please try again.')
        }
        throw err
      })
      toast.success('Update deleted')
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to delete update')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl font-bold text-slate-800">
                <span className="text-orange-600">Updates</span>
              </h1>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingId(null)
                if (!showForm) {
                  setForm({
                    title: '',
                    message: '',
                    festival: 'General Announcement',
                    ribbonColor: '#ef4444',
                    image: '',
                    isActive: true,
                  })
                  setImagePreview(null)
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus size={18} />
              New Update
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8 border border-slate-200">
            <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Update' : 'Create New Update'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded p-2 outline-none focus:border-orange-500"
                  placeholder="Update title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded p-2 outline-none focus:border-orange-500"
                  placeholder="Update message"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Festival/Holiday</label>
                  <select
                    name="festival"
                    value={form.festival}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded p-2 outline-none focus:border-orange-500"
                  >
                    {NIGERIA_FESTIVALS.map(festival => (
                      <option key={festival} value={festival}>{festival}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ribbon Color</label>
                  <div className="flex gap-2">
                    {RIBBON_COLORS.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, ribbonColor: color.value }))}
                        className={`w-10 h-10 rounded border-2 ${
                          form.ribbonColor === color.value ? 'border-slate-800' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-slate-300 rounded p-2"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-600 mb-2">Preview:</p>
                    <img src={imagePreview} alt="preview" className="max-w-xs h-auto rounded" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="rounded"
                />
                <label className="text-sm font-medium">Active (Show in frontend)</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-orange-400"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                  className="px-6 py-2 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Updates List */}
        {updatesLoading ? (
          <p className="text-slate-500">Loading updates...</p>
        ) : updates.length === 0 ? (
          <p className="text-slate-500">No updates yet.</p>
        ) : (
          <div className="grid gap-4">
            {updates.map(update => (
              <div key={update.id} className="bg-white rounded-lg shadow p-6 border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="px-3 py-1 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: update.ribbonColor || '#ef4444' }}
                      >
                        {update.festival || 'General'}
                      </div>
                      {update.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">Inactive</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">{update.title}</h3>
                    <p className="text-slate-600 mt-2">{update.message}</p>
                    {update.image && (
                      <img src={update.image} alt={update.title} className="mt-4 max-w-xs h-auto rounded" />
                    )}
                    <p className="text-xs text-slate-500 mt-4">
                      Created: {update.createdAt ? new Date(update.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(update)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
