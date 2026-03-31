import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBookingConfirmation, sendAdminBookingNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const bookingId = body.extra_attributes?.find((a: { key: string }) => a.key === 'booking_id')?.value;
    const status = body.order_status?.key;

    if (!bookingId) return NextResponse.json({ ok: true });

    if (status === 'completed') {
      await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);
      await sendEmailsForBooking(supabase, bookingId);
    } else if (status === 'rejected' || status === 'expired') {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendEmailsForBooking(supabase: any, bookingId: string) {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, cottages(name)')
      .eq('id', bookingId)
      .single() as { data: {
        id: string; guest_name: string; guest_email: string; guest_phone: string;
        check_in: string; check_out: string; guests_count: number; total_price: number;
        cottages: { name: string };
      } | null };

    if (!booking) return;

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
    console.error('Email send failed:', e);
  }
}
