import { NextResponse } from 'next/server'
import Flutterwave from 'flutterwave-node-v3'

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
)

export async function POST(request) {
  try {
    const { amount, currency, email, name, type, reference } = await request.json()

    // Validate required fields
    if (!amount || !currency || !email || !name || !type || !reference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create payment payload
    const payload = {
      tx_ref: reference,
      amount: amount / 100, // Convert from kobo to naira
      currency: currency.toUpperCase(),
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?type=${type}&ref=${reference}`,
      payment_options: 'card',
      customer: {
        email,
        name,
      },
      customizations: {
        title: 'CraveStore Payment',
        description: `${type} payment`,
        logo: 'https://your-logo-url.com/logo.png', // Replace with actual logo
      },
    }

    // Initiate payment
    const response = await flw.Charge.card(payload)

    if (response.status === 'success') {
      return NextResponse.json({
        status: 'success',
        data: {
          link: response.data.link,
          reference: response.data.tx_ref,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Payment initiation failed', details: response },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}