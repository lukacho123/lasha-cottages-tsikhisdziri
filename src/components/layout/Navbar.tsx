'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, TreePine, Globe } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

const localeLabels: Record<string, string> = { ka: 'ქარ', en: 'ENG', ru: 'РУС' };

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function switchLocale(newLocale: string) {
    // Replace locale prefix in path
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setLangOpen(false);
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-[#0a1628]/95 backdrop-blur-md shadow-lg shadow-black/20 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-white font-bold text-xl group">
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TreePine className="w-5 h-5 text-white" />
          </div>
          <span>ციხისძირი</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {([`/${locale}`, `/${locale}/cottages`, `/${locale}#contact`] as const).map((href, i) => {
            const labels = [t('home'), t('cottages'), t('contact')];
            return (
              <Link key={href} href={href} className="text-white/70 hover:text-white transition-colors text-sm font-medium tracking-wide">
                {labels[i]}
              </Link>
            );
          })}
          <Link
            href={`/${locale}/cottages`}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-green-900/30"
          >
            {t('book')}
          </Link>

          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
            >
              <Globe className="w-4 h-4" />
              {localeLabels[locale]}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 bg-[#0d1f3c] border border-white/10 rounded-xl overflow-hidden shadow-xl shadow-black/40 z-50">
                {['ka', 'en', 'ru'].map(l => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                      l === locale ? 'text-green-400 font-semibold' : 'text-white/70'
                    }`}
                  >
                    {localeLabels[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#0a1628]/98 backdrop-blur-md border-t border-white/10 px-4 py-5 flex flex-col gap-4">
          {([`/${locale}`, `/${locale}/cottages`, `/${locale}#contact`] as const).map((href, i) => {
            const labels = [t('home'), t('cottages'), t('contact')];
            return (
              <Link key={href} href={href} className="text-white/70 hover:text-white py-1" onClick={() => setIsOpen(false)}>
                {labels[i]}
              </Link>
            );
          })}
          <Link
            href={`/${locale}/cottages`}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full text-center font-semibold"
            onClick={() => setIsOpen(false)}
          >
            {t('book')}
          </Link>
          {/* Mobile language switcher */}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            {['ka', 'en', 'ru'].map(l => (
              <button
                key={l}
                onClick={() => { switchLocale(l); setIsOpen(false); }}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  l === locale ? 'bg-green-500/20 text-green-400 font-semibold' : 'text-white/50 hover:text-white'
                }`}
              >
                {localeLabels[l]}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
