import { NextResponse } from 'next/server';

// Stripe webhook — შეცვლილია BOG/TBC callbacks-ით
// BOG: /api/callback/bog
// TBC: /api/callback/tbc
export async function POST() {
  return NextResponse.json({ ok: true });
}
