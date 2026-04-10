import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { orderId, total, userId } = await request.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_FROM_NUMBER;
    const toNumber = process.env.ADMIN_WHATSAPP_NUMBER || process.env.ADMIN_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber || !toNumber) {
      return NextResponse.json({ error: 'Twilio configuration missing in environment' }, { status: 500 });
    }

    // Twilio WhatsApp format: whatsapp:+14155238886
    const presets = {
      from: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
      to: toNumber.startsWith('whatsapp:') ? toNumber : `whatsapp:${toNumber}`,
    };

    const bodyText = `New order received: #${orderId}. Total: $${((total || 0) / 100).toFixed(2)}. User ID: ${userId}.`;
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
