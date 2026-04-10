'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
    const router = useRouter()
    
    useEffect(() => {
        // Redirect to login if accessing /admin directly
        router.push('/admin/login')
    }, [router])
    
    return null
}