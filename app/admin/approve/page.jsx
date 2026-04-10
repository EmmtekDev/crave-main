'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function AdminApprove() {
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

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

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

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
            <div className="bg-white shadow-sm border-b border-slate-200 mb-8">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="text-slate-600 hover:text-slate-800">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-800">
                            <span className="text-orange-600">Approve Stores</span>
                        </h1>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-slate-500 mb-28">
                    <h2 className="text-xl font-semibold">Coming Soon</h2>
                    <p>Store approval features coming in the next update.</p>
                </div>
            </div>
        </div>
    )
}