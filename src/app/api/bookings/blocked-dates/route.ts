import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format, parseISO } from 'date-fns';

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const cottageId = req.nextUrl.searchParams.get('cottage_id');
  if (!cottageId) return NextResponse.json([]);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('check_in, check_out')
    .eq('cottage_id', cottageId)
    .in('status', ['confirmed', 'pending']);

  if (!bookings) return NextResponse.json([]);

  // Generate all blocked dates between check_in and check_out
  const blockedDates: string[] = [];
  for (const booking of bookings) {
    let current = parseISO(booking.check_in);
    const end = parseISO(booking.check_out);
    while (current < end) {
      blockedDates.push(format(current, 'yyyy-MM-dd'));
      current = addDays(current, 1);
    }
  }

  return NextResponse.json(blockedDates);
}
