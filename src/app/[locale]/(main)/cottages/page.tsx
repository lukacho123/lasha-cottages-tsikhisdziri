import { supabase } from '@/lib/supabase';
import { Cottage } from '@/types';
import CottageCard from '@/components/ui/CottageCard';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function CottagesPage() {
  const t = await getTranslations('cottages');
  const { data: cottages, error } = await supabase
    .from('cottages')
    .select('*')
    .order('price_per_night', { ascending: true }) as { data: Cottage[] | null; error: Error | null };

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <div className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/80 to-[#0a1628]" />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <span className="text-green-400 text-sm font-semibold tracking-widest uppercase">{t('location')}</span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mt-3 mb-5">{t('heading')}</h1>
          <p className="text-white/50 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        {error && (
          <div className="text-center text-red-400 py-8 glass rounded-2xl">
            {t('error')}: {JSON.stringify(error)}
          </div>
        )}

        {!error && (!cottages || cottages.length === 0) && (
          <div className="text-center text-white/30 py-16">
            <p className="text-xl">{t('empty')}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cottages?.map((cottage: Cottage) => (
            <CottageCard key={cottage.id} cottage={cottage} />
          ))}
        </div>
      </div>
    </div>
  );
}
