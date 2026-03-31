import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const { cottage_id, guest_name, guest_email, guest_phone, check_in, check_out, guests_count, total_price } = body;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // TEST MODE — TBC keys არ არის დაყენებული
    if (!process.env.TBC_API_KEY || process.env.TBC_API_KEY === 'your_tbc_api_key') {
      const { data: booking } = await supabase
        .from('bookings')
        .insert({ cottage_id, guest_name, guest_email, guest_phone, check_in, check_out, guests_count, total_price, status: 'pending' })
        .select().single() as { data: { id: string } | null };
      return NextResponse.json({ redirectUrl: `${siteUrl}/booking/success?booking_id=${booking?.id}&test=tbc` });
    }

    const { data: cottage } = await supabase
      .from('cottages')
      .select('name')
      .eq('id', cottage_id)
      .single() as { data: { name: string } | null };

    if (!cottage) return NextResponse.json({ error: 'კოტეჯი ვერ მოიძებნა' }, { status: 404 });

    // Save pending booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({ cottage_id, guest_name, guest_email, guest_phone, check_in, check_out, guests_count, total_price, status: 'pending' })
      .select()
      .single() as { data: { id: string } | null; error: unknown };

    if (bookingError || !booking) return NextResponse.json({ error: 'ჯავშნის შენახვა ვერ მოხდა' }, { status: 500 });

    // Create TBC payment
    const paymentRes = await fetch('https://api.tbcbank.ge/v1/tpay/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.TBC_API_KEY!,
      },
      body: JSON.stringify({
        amount: {
          currency: 'GEL',
          total: total_price,
        },
        returnurl: `${siteUrl}/booking/success?booking_id=${booking.id}`,
        extra: booking.id,
        description: `${cottage.name} | ${check_in} - ${check_out} | ${guest_name}`,
        language: 'KA',
        merchantPaymentId: booking.id,
        saveCard: false,
        preAuth: false,
      }),
    });

    const payment = await paymentRes.json();

    if (!paymentRes.ok) {
      throw new Error(payment.status?.message || 'TBC payment creation failed');
    }

    // Save TBC payment ID
    await supabase.from('bookings').update({ stripe_session_id: payment.payId }).eq('id', booking.id);

    return NextResponse.json({ redirectUrl: payment.links?.redirect });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'შეცდომა მოხდა';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
