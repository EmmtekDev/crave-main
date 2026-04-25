import { NextResponse } from 'next/server'
import Flutterwave from 'flutterwave-node-v3'

export async function POST(request) {
  try {
    const flw = new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY
    )

    const payload = await request.text()
    const signature = request.headers.get('verif-hash')

    // Verify webhook signature
    const expectedSignature = process.env.FLUTTERWAVE_SECRET_KEY
    if (!signature || signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(payload)

    // Only process successful payments
    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      const { tx_ref, amount, currency } = event.data

      // Extract type and reference from tx_ref
      // tx_ref format: order-{id} or delivery-{trackingNumber}
      const [type, ref] = tx_ref.split('-', 2)

      if (type === 'order') {
        // Update order payment status using InstantDB REST API
        const response = await fetch('https://api.instantdb.com/transact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'app-id': process.env.NEXT_PUBLIC_INSTANT_DB_APP_ID,
            'steps': [
              {
                'kind': 'update',
                'table': 'orders',
                'id': ref,
                'attrs': {
                  'paymentStatus': 'paid',
                  'paymentReference': tx_ref,
                  'paidAt': new Date().toISOString(),
                }
              }
            ]
          })
        })

        if (!response.ok) {
          console.error('Failed to update order payment status')
        }
      } else if (type === 'delivery') {
        // Find delivery by tracking number first
        const findResponse = await fetch(`https://api.instantdb.com/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'app-id': process.env.NEXT_PUBLIC_INSTANT_DB_APP_ID,
            'query': {
              'deliveries': {}
            }
          })
        })

        if (findResponse.ok) {
          const data = await findResponse.json()
          const delivery = data.deliveries?.find(d => d.trackingNumber === ref)

          if (delivery) {
            // Update delivery payment status
            const updateResponse = await fetch('https://api.instantdb.com/transact', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                'app-id': process.env.NEXT_PUBLIC_INSTANT_DB_APP_ID,
                'steps': [
                  {
                    'kind': 'update',
                    'table': 'deliveries',
                    'id': delivery.id,
                    'attrs': {
                      'paymentStatus': 'paid',
                      'paymentReference': tx_ref,
                      'paidAt': new Date().toISOString(),
                    }
                  }
                ]
              })
            })

            if (!updateResponse.ok) {
              console.error('Failed to update delivery payment status')
            }
          }
        }
      }

      return NextResponse.json({ status: 'success' })
    }

    return NextResponse.json({ status: 'ignored' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}