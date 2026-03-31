import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { phone, code } = await req.json();
  if (!phone || !code) return NextResponse.json({ error: 'საჭირო მონაცემები არ არის' }, { status: 400 });

  const { data } = await supabase
    .from('phone_verifications')
    .select('*')
    .eq('phone', phone)
    .eq('code', code)
    .eq('verified', false)
    .single() as { data: { expires_at: string } | null };

  if (!data) return NextResponse.json({ error: 'კოდი არასწორია' }, { status: 400 });

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: 'კოდის ვადა გავიდა. ახალი კოდი გამოითხოვე.' }, { status: 400 });
  }

  // Mark as verified
  await supabase.from('phone_verifications').update({ verified: true }).eq('phone', phone);

  return NextResponse.json({ ok: true });
}
