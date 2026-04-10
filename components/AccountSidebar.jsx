'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const AccountSidebar = () => {
  const pathname = usePathname()

  const links = [
    { href: '/account/profile', label: 'Profile' },
    { href: '/account/orders', label: 'Orders' },
  ]

  return (
    <div className="flex flex-col gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2.5 rounded transition-colors ${
            pathname === link.href
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}

export default AccountSidebar
