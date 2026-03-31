import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBookingConfirmation, sendAdminBookingNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { booking_id } = await req.json();
  if (!booking_id) return NextResponse.json({ error: 'booking_id საჭიროა' }, { status: 400 });

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, cottages(name)')
    .eq('id', booking_id)
    .single() as {
      data: {
        id: string; guest_name: string; guest_email: string; guest_phone: string;
        check_in: string; check_out: string; guests_count: number; total_price: number;
        status: string; cottages: { name: string };
      } | null
    };

  if (!booking) return NextResponse.json({ error: 'ჯავშანი ვერ მოიძებნა' }, { status: 404 });

  // Confirm booking
  await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', booking_id);

  // Send emails
  try {
    await sendBookingConfirmation({
      guestEmail: booking.guest_email,
      guestName: booking.guest_name,
      cottageName: booking.cottages.name,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      guestsCount: booking.guests_count,
      totalPrice: booking.total_price,
      bookingId: booking.id,
    });

    await sendAdminBookingNotification({
      guestName: booking.guest_name,
      guestEmail: booking.guest_email,
      guestPhone: booking.guest_phone,
      cottageName: booking.cottages.name,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      guestsCount: booking.guests_count,
      totalPrice: booking.total_price,
    });
  } catch (e) {
    console.error('Email error:', e);
  }

  return NextResponse.json({ ok: true });
}
