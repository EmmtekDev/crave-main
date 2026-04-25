import { NextResponse } from 'next/server'
import Flutterwave from 'flutterwave-node-v3'
import db from '@/lib/instantdb'

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
)

export async function POST(request) {
  try {
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
        // Update order payment status
        await db.transact(
          db.tx.orders[ref].update({
            paymentStatus: 'paid',
            paymentReference: tx_ref,
            paidAt: new Date().toISOString(),
          })
        )
      } else if (type === 'delivery') {
        // Update delivery payment status
        const deliveries = await db.useQuery({ deliveries: {} })
        const delivery = deliveries.data?.deliveries?.find(d => d.trackingNumber === ref)

        if (delivery) {
          await db.transact(
            db.tx.deliveries[delivery.id].update({
              paymentStatus: 'paid',
              paymentReference: tx_ref,
              paidAt: new Date().toISOString(),
            })
          )
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