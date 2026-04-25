import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    if (!process.env.FLUTTERWAVE_SECRET_KEY || !process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json(
        { error: 'Payment gateway configuration is missing' },
        { status: 500 }
      )
    }

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

    // Initiate payment via Flutterwave REST API
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok || data.status !== 'success') {
      console.error('Flutterwave payment initiation failed:', data)
      return NextResponse.json(
        { error: data.message || 'Payment initiation failed', details: data },
        { status: 400 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: {
        link: data.data.authorization_url,
        reference: data.data.tx_ref,
      },
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}