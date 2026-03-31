import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Bed, Users, MapPin, Wifi, Waves, Car, Star, Flame, Trees } from 'lucide-react';
import BookingForm from '@/components/booking/BookingForm';
import { getTranslations } from 'next-intl/server';

const amenityConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  'WiFi':     { icon: <Wifi className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
  'ზღვა':    { icon: <Waves className="w-4 h-4" />, color: 'from-teal-500 to-cyan-600' },
  'პარკინგი': { icon: <Car className="w-4 h-4" />, color: 'from-slate-500 to-gray-600' },
  'ბარბექიუ': { icon: <Flame className="w-4 h-4" />, color: 'from-orange-500 to-red-500' },
  'ტერასა':  { icon: <Trees className="w-4 h-4" />, color: 'from-green-500 to-emerald-600' },
  'აუზი':    { icon: <Waves className="w-4 h-4" />, color: 'from-blue-600 to-indigo-600' },
};

export const dynamic = 'force-dynamic';

export default async function CottagePage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  const t = await getTranslations();

  const { data: cottage } = await supabase
    .from('cottages')
    .select('*')
    .eq('id', id)
    .single() as { data: import('@/types').Cottage | null };

  if (!cottage) notFound();

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <div className="relative h-[50vh] overflow-hidden">
        {cottage.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cottage.images[0]} alt={cottage.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-900 to-teal-900 flex items-center justify-center">
            <span className="text-8xl opacity-30">🌿</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/40 via-transparent to-[#0a1628]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 text-white/40 text-sm mb-3">
              <MapPin className="w-4 h-4 text-green-400" />
              {t('cottages.location')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{cottage.name}</h1>

            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-white/40 text-sm ml-2">5.0 · {t('cottages.excellent')}</span>
            </div>

            <p className="text-white/60 text-lg leading-relaxed mb-8">{cottage.description}</p>

            <div className="flex gap-4 mb-8">
              <div className="glass rounded-xl px-5 py-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white/40 text-xs">{t('cottages.guests')}</p>
                  <p className="text-white font-bold">{t('cottages.maxGuests')} {cottage.max_guests}</p>
                </div>
              </div>
              <div className="glass rounded-xl px-5 py-3 flex items-center gap-2">
                <Bed className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white/40 text-xs">{t('cottages.bedroom')}</p>
                  <p className="text-white font-bold">{cottage.bedrooms}</p>
                </div>
              </div>
            </div>

            {cottage.amenities?.length > 0 && (
              <div>
                <h3 className="font-bold text-white text-lg mb-4">{t('cottages.services')}</h3>
                <div className="flex flex-wrap gap-3">
                  {cottage.amenities.map((a: string) => {
                    const cfg = amenityConfig[a];
                    return (
                      <div key={a} className={`flex items-center gap-2 bg-gradient-to-r ${cfg?.color ?? 'from-gray-600 to-gray-700'} text-white px-4 py-2 rounded-full text-sm font-medium`}>
                        {cfg?.icon}
                        {a}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 sticky top-24 border-white/20">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-white">₾{cottage.price_per_night}</span>
                <span className="text-white/40">/ {t('cottages.perNight')}</span>
              </div>
              <div className="flex items-center gap-1 mb-6">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white/50 text-sm">5.0 · {t('cottages.excellent')}</span>
              </div>
              <BookingForm cottageId={cottage.id} pricePerNight={cottage.price_per_night} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
