'use client'
import { useState } from 'react'
import db from '@/lib/instantdb'
import toast from 'react-hot-toast'
import { id } from '@instantdb/react'

const sampleProducts = [
  {
    name: 'Modern table lamp',
    description: 'Beautiful modern table lamp with adjustable brightness',
    price: 2900,
    mrp: 4000,
    category: 'Decoration',
    images: ['https://via.placeholder.com/300?text=lamp'],
    store_id: 'store_1',
    in_stock: true,
  },
  {
    name: 'Smart speaker gray',
    description: 'Voice-controlled smart speaker with premium sound',
    price: 2900,
    mrp: 5000,
    category: 'Electronics',
    images: ['https://via.placeholder.com/300?text=speaker'],
    store_id: 'store_1',
    in_stock: true,
  },
  {
    name: 'Smart watch white',
    description: 'Latest smart watch with health and fitness tracking',
    price: 2900,
    mrp: 6000,
    category: 'Watches',
    images: ['https://via.placeholder.com/300?text=watch'],
    store_id: 'store_1',
    in_stock: true,
  },
]

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)

  const handleSeed = async () => {
    setLoading(true)
    try {
      // Insert all products with generated UUIDs
      const tx = sampleProducts.map(product => 
        db.tx.products[id()].update(product)
      )
      await db.transact(...tx).catch(err => {
        if (err.message?.includes('closing')) {
          throw new Error('Database connection lost. Please try again.')
        }
        throw err
      })
      
      toast.success(`${sampleProducts.length} products added to Instant DB!`)
      setSeeded(true)
    } catch (err) {
      toast.error('Error seeding products: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Seed Products</h1>
        <p className="text-slate-600 mb-6">
          Click below to add sample products to your Instant DB instance. They'll appear in the Explorer.
        </p>
        
        {seeded ? (
          <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
            <p className="text-green-800 font-medium">✅ Products seeded!</p>
            <p className="text-sm text-green-700 mt-2">Visit the shop page to see them, or check your Instant DB Explorer.</p>
          </div>
        ) : null}

        <button
          onClick={handleSeed}
          disabled={loading || seeded}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
        >
          {loading ? 'Seeding...' : seeded ? 'Already Seeded' : 'Seed Products'}
        </button>

        <p className="text-xs text-slate-500 mt-6">
          After seeding, you can run <code className="bg-slate-100 px-2 py-1 rounded">npx instant-cli@latest pull</code> to sync the schema.
        </p>
      </div>
    </div>
  )
}
