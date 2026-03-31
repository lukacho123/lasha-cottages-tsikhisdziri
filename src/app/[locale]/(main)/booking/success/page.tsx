'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const isTest = searchParams.get('test');
  const [sent, setSent] = useState(false);
  const t = useTranslations('success');

  useEffect(() => {
    if (!bookingId || sent) return;
    setSent(true);
    fetch('/api/booking/confirm-and-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId }),
    });
  }, [bookingId, sent]);

  return (
    <div className="max-w-lg w-full text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-900/40">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>

      <h1 className="text-4xl font-bold text-white mb-4">{t('title')}</h1>
      <p className="text-white/50 mb-3 text-lg">{t('subtitle')}</p>
      <p className="text-white/40 mb-10 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        {t('emailSending')}
      </p>

      {isTest && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-8 text-yellow-300 text-sm">
          🧪 Test mode — {isTest.toUpperCase()}-ით გადახდა
        </div>
      )}

      <Link href="/"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-10 py-4 rounded-full font-semibold transition-all hover:scale-105 shadow-lg"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-white/40">იტვირთება...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
