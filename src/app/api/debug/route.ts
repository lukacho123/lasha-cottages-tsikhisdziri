import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serverAnon = process.env.SUPABASE_ANON_KEY;

  return NextResponse.json({
    url: url ? url.substring(0, 30) + '...' : 'MISSING',
    anonKey: anonKey ? anonKey.substring(0, 20) + '...' : 'MISSING',
    serviceKey: serviceKey ? serviceKey.substring(0, 20) + '...' : 'MISSING',
    serverAnon: serverAnon ? serverAnon.substring(0, 20) + '...' : 'MISSING',
  });
}
