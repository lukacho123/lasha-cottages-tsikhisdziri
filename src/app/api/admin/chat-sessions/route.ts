import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from('chat_messages')
    .select('session_id, text, created_at')
    .order('created_at', { ascending: false });

  if (!data) return NextResponse.json([]);

  // Group by session_id and get latest message per session
  const sessionMap = new Map<string, { session_id: string; last_message: string; updated_at: string }>();
  for (const msg of data) {
    if (!sessionMap.has(msg.session_id)) {
      sessionMap.set(msg.session_id, {
        session_id: msg.session_id,
        last_message: msg.text,
        updated_at: msg.created_at,
      });
    }
  }

  return NextResponse.json(Array.from(sessionMap.values()));
}
