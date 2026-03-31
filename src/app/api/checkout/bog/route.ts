import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getBogToken(): Promise<string> {
  const res = await fetch('https://api.bog.ge/auth/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.BOG_CLIENT_ID}:${process.env.BOG_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const { cottage_id, guest_name, guest_email, guest_phone, check_in, check_out, guests_count, total_price } = body;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // TEST MODE — BOG keys არ არის დაყენებული
    if (!process.env.BOG_CLIENT_ID || process.env.BOG_CLIENT_ID === 'your_bog_client_id') {
      const { data: booking } = await supabase
        .from('bookings')
        .insert({ cottage_id, guest_name, guest_email, guest_phone, check_in, check_out, guests_count, total_price, status: 'pending' })
        .select().single() as { data: { id: string } | null };
      return NextResponse.json({ redirectUrl: `${siteUrl}/booking/success?booking_id=${booking?.id}&test=bog` });
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

    // Get BOG access token
    const token = await getBogToken();

    // Create BOG order
    const orderRes = await fetch('https://api.bog.ge/payments/v1/ecommerce/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        callback_url: `${siteUrl}/api/callback/bog`,
        purchase_units: {
          currency: 'GEL',
          total_amount: total_price,
          basket: [
            {
              quantity: 1,
              unit_price: total_price,
              product_id: cottage_id,
              description: `${cottage.name} | ${check_in} - ${check_out}`,
            },
          ],
        },
        redirect_urls: {
          success: `${siteUrl}/booking/success?booking_id=${booking.id}`,
          fail: `${siteUrl}/cottages/${cottage_id}?payment=failed`,
        },
        buyer: {
          full_name: guest_name,
          email: guest_email,
        },
        extra_attributes: [{ key: 'booking_id', value: booking.id }],
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      throw new Error(order.message || 'BOG order creation failed');
    }

    // Save BOG order ID
    await supabase.from('bookings').update({ stripe_session_id: order.id }).eq('id', booking.id);

    return NextResponse.json({ redirectUrl: order._links?.redirect?.href });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'შეცდომა მოხდა';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
