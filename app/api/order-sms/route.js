import { NextResponse } from 'next/server';

// Email notifications using Resend
export async function POST(request) {
  try {
    const { orderId, total, userId, type = 'order', ...extra } = await request.json();

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@craveonline.store';

    if (!resendApiKey) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
    }

    let subject = type === 'dispatch' ? `New Dispatch Order: ${orderId}` : `New Shop Order: ${orderId}`;
    let bodyText = type === 'dispatch' 
      ? `New Dispatch Order: #${orderId}\nTotal: ₦${((total || 0) / 100).toFixed(2)}\nUser ID: ${userId}\nSender: ${extra.senderName} (${extra.senderPhone})\nReceiver: ${extra.receiverName} (${extra.receiverPhone})\nVehicle: ${extra.vehicleType}\nFrom: ${extra.fromLocation}\nTo: ${extra.toLocation}`
      : `New Shop Order: #${orderId}\nTotal: ₦${((total || 0) / 100).toFixed(2)}\nUser ID: ${userId}\nItems: ${extra.items?.map(item => `${item.name} (x${item.quantity})`).join(', ') || 'N/A'}\nAddress: ${extra.address}\nPayment: ${extra.paymentMethod}`;

    const emailPayload = {
      from: 'CraveStore <smile33c@gmail.com>',
      to: adminEmail,
      subject,
      text: bodyText,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Resend API error', details: errorText }, { status: response.status });
    }

    const resendData = await response.json();
    return NextResponse.json({ success: true, id: resendData.id });
  } catch (error) {
    console.error('Email notification error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
