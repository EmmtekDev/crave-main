'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

export default function PaymentCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('verifying')

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      const ref = params.get('ref')
      const transactionId = params.get('transaction_id')
      const txRef = params.get('tx_ref')

      if (!type || !ref) {
        setStatus('error')
        toast.error('Invalid payment callback')
        return
      }

      try {
        // Verify payment with Flutterwave
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId, txRef }),
        })

        const result = await response.json()

        if (result.status === 'success') {
          setStatus('success')
          toast.success('Payment successful!')

          // Redirect based on type
          setTimeout(() => {
            if (type === 'order') {
              router.push(`/thank-you?type=order&ref=${ref}`)
            } else if (type === 'delivery') {
              router.push(`/thank-you?type=dispatch&ref=${ref}`)
            }
          }, 2000)
        } else {
          setStatus('failed')
          toast.error('Payment verification failed')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        toast.error('Payment verification error')
      }
    }

    verifyPayment()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <div className="mb-6">
          {status === 'verifying' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          )}
          {status === 'success' && (
            <div className="text-green-500 text-6xl">✓</div>
          )}
          {status === 'failed' && (
            <div className="text-red-500 text-6xl">✗</div>
          )}
          {status === 'error' && (
            <div className="text-red-500 text-6xl">⚠</div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'verifying' && 'Verifying Payment...'}
          {status === 'success' && 'Payment Successful!'}
          {status === 'failed' && 'Payment Failed'}
          {status === 'error' && 'Payment Error'}
        </h2>

        <p className="text-gray-600">
          {status === 'verifying' && 'Please wait while we verify your payment.'}
          {status === 'success' && 'Your payment has been processed successfully.'}
          {status === 'failed' && 'Your payment could not be verified. Please contact support.'}
          {status === 'error' && 'There was an error processing your payment. Please try again.'}
        </p>
      </div>
    </div>
  )
}