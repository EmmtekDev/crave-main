'use client'
import { Search, ShoppingCart, Bell, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import db from '@/lib/instantdb'
import { useUpdates } from '@/lib/instantdbHooks'

const Navbar = () => {

    const router = useRouter();
    const [search, setSearch] = useState('')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { user } = db.useAuth()
    const cartCount = useSelector(state => state.cart.total)
    const { activeUpdates } = useUpdates()
    const [hasNewUpdates, setHasNewUpdates] = useState(false)

    useEffect(() => {
        // Check if there are new updates not yet seen
        if (activeUpdates.length > 0 && !localStorage.getItem('updates_seen')) {
            setHasNewUpdates(true)
        }
    }, [activeUpdates])

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    const handleSignOut = async () => {
        try {
            await db.auth.signOut()
            router.push('/')
            router.refresh()
        } catch (err) {
            console.error('Sign out error:', err)
        }
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-orange-600">Crave.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-orange-500">
                            Store
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600 text-sm">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/delivery">Dispatch</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>
                        {user && <Link href="/account/orders">Orders</Link>}

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <button onClick={() => setHasNewUpdates(false)} className="relative flex items-center gap-2 text-slate-600 hover:text-slate-800">
                            <Bell size={18} />
                            {hasNewUpdates && (
                                <span className="absolute -top-1 left-2 size-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <p className="text-sm">{user.email}</p>
                                <button onClick={handleSignOut} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">Sign out</button>
                            </div>
                        ) : (
                            <a href="/auth" className="px-6 py-2 bg-orange-600 hover:bg-orange-700 transition text-white rounded-full">Login</a>
                        )}

                    </div>

                    {/* Mobile Hamburger & Cart  */}
                    <div className="sm:hidden flex items-center gap-3">
                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 p-2">
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="sm:hidden bg-white border-t border-slate-200 px-6 py-4 flex flex-col gap-3 text-slate-600">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-2">Home</Link>
                        <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="py-2">Shop</Link>
                        <Link href="/delivery" onClick={() => setMobileMenuOpen(false)} className="py-2">Dispatch</Link>
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-2">About</Link>
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-2">Contact</Link>
                        {user && <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="py-2">Orders</Link>}

                        <form onSubmit={(e) => {
                            handleSearch(e)
                            setMobileMenuOpen(false)
                        }} className="flex items-center text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full mt-2">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <button onClick={() => setHasNewUpdates(false)} className="flex items-center gap-2 py-2 mt-2">
                            <Bell size={18} />
                            Notifications
                            {hasNewUpdates && (
                                <span className="size-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        <div className="border-t border-slate-200 pt-3 mt-2">
                            {user ? (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium">{user.email}</p>
                                    <Link href="/account/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm py-2">Profile</Link>
                                    <button onClick={() => {
                                        handleSignOut()
                                        setMobileMenuOpen(false)
                                    }} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full">Sign out</button>
                                </div>
                            ) : (
                                <a href="/auth" onClick={() => setMobileMenuOpen(false)} className="block px-6 py-2 bg-orange-600 hover:bg-orange-700 transition text-white rounded-full text-center">Login</a>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar