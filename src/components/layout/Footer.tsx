import { TreePine, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <footer className="bg-[#060e1c] border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-xl font-bold mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            ციხისძირი კოტეჯები
          </div>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            {t('footer.description')}
          </p>
          <div className="flex gap-3 mt-6">
            <a href="#" className="w-9 h-9 glass rounded-full flex items-center justify-center hover:border-green-400/50 transition-all hover:scale-110 text-white/60 text-xs font-bold">IG</a>
            <a href="#" className="w-9 h-9 glass rounded-full flex items-center justify-center hover:border-green-400/50 transition-all hover:scale-110 text-white/60 text-xs font-bold">FB</a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm tracking-widest uppercase text-white/40 mb-5">{t('footer.links')}</h3>
          <ul className="space-y-3">
            {([
              [`/${locale}`, t('nav.home')],
              [`/${locale}/cottages`, t('nav.cottages')],
              [`/${locale}#contact`, t('nav.contact')],
            ] as [string, string][]).map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-white/60 hover:text-green-400 transition-colors text-sm">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm tracking-widest uppercase text-white/40 mb-5">{t('contact.label')}</h3>
          <ul className="space-y-4">
            {[
              { Icon: MapPin, text: t('contact.address') },
              { Icon: Phone, text: t('contact.phone') },
              { Icon: Mail, text: t('contact.email') },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/60 text-sm">
                <Icon className="w-4 h-4 text-green-400 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 text-center text-white/20 text-xs py-5">
        © {new Date().getFullYear()} ციხისძირი კოტეჯები. {t('footer.rights')}.
      </div>
    </footer>
  );
}
