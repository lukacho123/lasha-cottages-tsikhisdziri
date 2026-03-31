import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const bookingId = body.extra;
    const status = body.status;

    if (!bookingId) return NextResponse.json({ ok: true });

    if (status === 'Succeeded') {
      await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);
    } else if (status === 'Failed' || status === 'Expired') {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
