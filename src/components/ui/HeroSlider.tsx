'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

const slideImages = [
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1600&q=80',
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1600&q=80',
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const t = useTranslations('hero');
  const tc = useTranslations('cottages');
  const locale = useLocale();

  const slides = slideImages.map((url, i) => ({
    url,
    title: t(`slides.${i}.title`),
    subtitle: t(`slides.${i}.subtitle`),
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setAnimating(false);
      }, 500);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (index: number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  };

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover scale-105 transition-transform duration-[8000ms]"
            style={{ transform: i === current ? 'scale(1.05)' : 'scale(1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>
      ))}

      <div
        className={`relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4 transition-all duration-500 ${
          animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <span className="text-green-300 text-sm font-semibold tracking-widest uppercase mb-4">
          {t('location')}
        </span>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
          {slides[current].title}
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl">
          {slides[current].subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/${locale}/cottages`}
            className="bg-green-500 hover:bg-green-400 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105 shadow-lg"
          >
            {t('viewCottages')}
          </Link>
          <Link
            href={`/${locale}#contact`}
            className="border-2 border-white/70 text-white hover:bg-white/10 px-10 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105 backdrop-blur-sm"
          >
            {t('contact')}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-8 h-3 bg-white' : 'w-3 h-3 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-8 right-8 z-10 text-white/60 text-sm flex flex-col items-center gap-1 animate-bounce">
        <span>↓</span>
        <span className="text-xs">{tc('scrollDown')}</span>
      </div>
    </section>
  );
}
