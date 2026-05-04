'use client'

import Link from 'next/link'

export default function ThankYouPage({ searchParams }) {
  const type = (searchParams?.type || '').toLowerCase()
  const ref = searchParams?.ref || ''

  const title = type === 'dispatch'
    ? 'Dispatch Request Received'
    : type === 'order'
      ? 'Order Confirmed'
      : 'Thank You'

  const message = type === 'dispatch'
    ? 'Your dispatch request has been received and is now being processed. We will notify you with tracking updates shortly.'
    : type === 'order'
      ? 'Your order has been placed successfully. We appreciate your purchase and will notify you when it ships.'
      : 'Thank you for your submission. We will be in touch soon.'

  const actionLink = type === 'dispatch'
    ? ref ? `/delivery/${ref}` : '/delivery'
    : type === 'order'
      ? '/orders'
      : '/'

  const actionLabel = type === 'dispatch'
    ? 'View Dispatch Status'
    : type === 'order'
      ? 'View Orders'
      : 'Back to Home'

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl p-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700 mb-8">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">{title}</h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8">{message}</p>
        {ref ? (
          <p className="text-slate-500 mb-6">Reference: <span className="font-medium text-slate-800">{ref}</span></p>
        ) : null}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={actionLink} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-7 py-3 text-white text-sm font-semibold hover:bg-slate-800 transition">
            {actionLabel}
          </Link>
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-7 py-3 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}
