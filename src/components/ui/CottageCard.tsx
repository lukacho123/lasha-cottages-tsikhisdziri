import { Cottage } from '@/types';
import { Users, Bed, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function CottageCard({ cottage }: { cottage: Cottage }) {
  const t = await getTranslations('cottages');
  const locale = await getLocale();

  return (
    <div className="group glass rounded-2xl overflow-hidden hover:border-green-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-900/30">
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-green-900 to-teal-900">
        {cottage.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cottage.images[0]}
            alt={cottage.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-40">🌿</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold border border-white/20">
          ₾{cottage.price_per_night}<span className="text-white/60 font-normal">/{t('perNight')}</span>
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-sm font-semibold">5.0</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
          {cottage.name}
        </h3>
        <p className="text-white/50 text-sm mb-5 line-clamp-2 leading-relaxed">{cottage.description}</p>

        <div className="flex gap-4 text-sm text-white/40 mb-6">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-green-400" />
            <span>{cottage.max_guests} {t('guests')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-blue-400" />
            <span>{cottage.bedrooms} {t('bedroom')}</span>
          </div>
        </div>

        <Link
          href={`/${locale}/cottages/${cottage.id}`}
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all group-hover:shadow-lg group-hover:shadow-green-900/40"
        >
          {t('book')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
