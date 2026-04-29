import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { orderId, total, userId, type = 'order', ...extra } = await request.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_FROM_NUMBER;
    const toNumber = process.env.ADMIN_WHATSAPP_NUMBER || process.env.ADMIN_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber || !toNumber) {
      return NextResponse.json({ error: 'Twilio configuration missing in environment' }, { status: 500 });
    }

    // Twilio SMS format (for testing - change back to WhatsApp later)
    const presets = {
      from: fromNumber,
      to: toNumber,
    };

    let bodyText = ''
    if (type === 'dispatch') {
      bodyText = `🚚 New Dispatch Order: #${orderId}\n💰 Total: ₦${((total || 0) / 100).toFixed(2)}\n👤 User ID: ${userId}\n📤 Sender: ${extra.senderName} (${extra.senderPhone})\n📥 Receiver: ${extra.receiverName} (${extra.receiverPhone})\n🚗 Vehicle: ${extra.vehicleType}\n📍 From: ${extra.fromLocation}\n📍 To: ${extra.toLocation}`
    } else {
      const itemsSummary = extra.items?.map(item => `${item.name} (x${item.quantity})`).join(', ') || 'N/A'
      bodyText = `🛒 New Shop Order: #${orderId}\n💰 Total: ₦${((total || 0) / 100).toFixed(2)}\n👤 User ID: ${userId}\n📦 Items: ${itemsSummary}\n📍 Address: ${extra.address}\n💳 Payment: ${extra.paymentMethod}`
    }
    const params = new URLSearchParams({
      From: presets.from,
      To: presets.to,
      Body: bodyText,
    });

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Twilio API returned error', details: errorText }, { status: response.status });
    }

    const twilioData = await response.json();
    return NextResponse.json({ success: true, sid: twilioData.sid });
  } catch (error) {
    console.error('order-sms API error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
