import { NextResponse } from 'next/server'
import Flutterwave from 'flutterwave-node-v3'

export async function POST(request) {
  try {
    const flw = new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY
    )

    const { transactionId, txRef } = await request.json()

    if (!transactionId && !txRef) {
      return NextResponse.json(
        { error: 'Transaction ID or reference required' },
        { status: 400 }
      )
    }

    // Verify payment
    const response = await flw.Transaction.verify({
      id: transactionId || txRef
    })

    if (response.status === 'success' && response.data.status === 'successful') {
      return NextResponse.json({
        status: 'success',
        data: response.data,
      })
    } else {
      return NextResponse.json({
        status: 'failed',
        data: response.data,
      })
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}