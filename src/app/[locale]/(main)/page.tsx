import Link from 'next/link';
import { Waves, TreePine, Star, ShieldCheck, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import HeroSlider from '@/components/ui/HeroSlider';
import ChatWidget from '@/components/ui/ChatWidget';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { getTranslations } from 'next-intl/server';

const gallery = [
  'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
];

export default async function HomePage() {
  const t = await getTranslations();

  const features = [
    { icon: Waves, key: 'sea', color: 'from-blue-500 to-cyan-400' },
    { icon: TreePine, key: 'nature', color: 'from-green-500 to-emerald-400' },
    { icon: ShieldCheck, key: 'security', color: 'from-indigo-500 to-blue-400' },
    { icon: Star, key: 'comfort', color: 'from-amber-500 to-orange-400' },
  ] as const;

  const stats = [
    { value: '10+', label: t('stats.cottages') },
    { value: '500+', label: t('stats.guests') },
    { value: '5★', label: t('stats.rating') },
    { value: '24/7', label: t('stats.support') },
  ];

  return (
    <div className="bg-[#0a1628]">
      <HeroSlider />
      <ChatWidget />

      {/* Stats bar */}
      <section className="bg-gradient-to-r from-[#0d4a2d] to-[#0f2744] py-10 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-green-300/70 text-sm tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-green-400 text-sm font-semibold tracking-widest uppercase">{t('features.title')}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">{t('features.heading')}</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, key, color }, i) => (
            <ScrollReveal key={key} delay={i * 100}>
              <div className="group glass rounded-2xl p-7 hover:border-white/30 transition-all duration-300 hover:-translate-y-2 cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{t(`features.${key}.title`)}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{t(`features.${key}.desc`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Gallery strip */}
      <section className="py-4 overflow-hidden">
        <div className="flex gap-4 animate-none">
          <div className="flex gap-4 shrink-0">
            {gallery.map((url, i) => (
              <div key={i} className="w-72 h-48 rounded-2xl overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-transparent to-[#0a1628]" />
        </div>
        <ScrollReveal>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="gradient-text">{t('cta.title')}</span>
            </h2>
            <p className="text-white/60 text-xl mb-10">{t('cta.subtitle')}</p>
            <Link
              href="/cottages"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-10 py-5 rounded-full text-lg font-semibold transition-all hover:scale-105 shadow-xl shadow-green-900/40"
            >
              {t('cta.button')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-4 bg-gradient-to-b from-[#0a1628] to-[#0d1f3c]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-green-400 text-sm font-semibold tracking-widest uppercase">{t('contact.label')}</span>
              <h2 className="text-4xl font-bold text-white mt-3">{t('contact.title')}</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: 'მისამართი', value: t('contact.address') },
              { icon: Phone, label: 'ტელეფონი', value: t('contact.phone') },
              { icon: Mail, label: 'ელ-ფოსტა', value: t('contact.email') },
            ].map(({ icon: Icon, label, value }, i) => (
              <ScrollReveal key={label} delay={i * 100}>
                <div className="glass rounded-2xl p-8 text-center hover:border-green-500/40 transition-all group">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white/40 text-sm mb-2 tracking-wide">{label}</p>
                  <p className="text-white font-semibold text-lg">{value}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
