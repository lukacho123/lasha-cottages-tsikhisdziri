import { NextResponse } from 'next/server';

// გადახდა ახლა /api/checkout/bog და /api/checkout/tbc-ში ხდება
export async function POST() {
  return NextResponse.json({ error: 'გამოიყენე /api/checkout/bog ან /api/checkout/tbc' }, { status: 410 });
}
