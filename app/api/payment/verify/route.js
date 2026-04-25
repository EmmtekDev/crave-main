import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment gateway configuration is missing' },
        { status: 500 }
      )
    }

    const { transactionId, txRef } = await request.json()

    if (!transactionId && !txRef) {
      return NextResponse.json(
        { error: 'Transaction ID or reference required' },
        { status: 400 }
      )
    }

    const verificationId = transactionId || txRef
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${verificationId}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (response.ok && data.status === 'success' && data.data.status === 'successful') {
      return NextResponse.json({
        status: 'success',
        data: data.data,
      })
    }

    return NextResponse.json({
      status: 'failed',
      data,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
