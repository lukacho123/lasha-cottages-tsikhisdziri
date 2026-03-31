import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: 'ტელეფონი საჭიროა' }, { status: 400 });

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  // Save code to DB
  await supabase.from('phone_verifications').upsert({
    phone,
    code,
    expires_at: expiresAt,
    verified: false,
  }, { onConflict: 'phone' });

  // TEST MODE — Twilio keys არ არის
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
    console.log(`[TEST SMS] Phone: ${phone}, Code: ${code}`);
    return NextResponse.json({ ok: true, testCode: code });
  }

  // Send SMS via Twilio
  try {
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await twilio.messages.create({
      body: `ციხისძირი კოტეჯები — თქვენი კოდია: ${code} (მოქმედებს 10 წუთი)`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SMS გაგზავნა ვერ მოხდა';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
