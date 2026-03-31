'use client';

import { useState, useEffect } from 'react';
import { differenceInDays, parseISO, eachDayOfInterval, addDays, format } from 'date-fns';
import { Users, User, Mail, Phone, ArrowRight, Lock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { useTranslations } from 'next-intl';

interface BookingFormProps {
  cottageId: string;
  pricePerNight: number;
}

type PaymentMethod = 'bog' | 'tbc';
type Step = 'form' | 'verify' | 'payment';

export default function BookingForm({ cottageId, pricePerNight }: BookingFormProps) {
  const t = useTranslations('booking');
  const tv = useTranslations('verify');

  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '',
    check_in: '', check_out: '', guests_count: 1,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bog');
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const [smsCode, setSmsCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [testCode, setTestCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [error, setError] = useState('');
  const [smsError, setSmsError] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetch(`/api/bookings/blocked-dates?cottage_id=${cottageId}`)
      .then(r => r.json()).then(setBlockedDates);
  }, [cottageId]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const nights = form.check_in && form.check_out
    ? Math.max(0, differenceInDays(new Date(form.check_out), new Date(form.check_in))) : 0;
  const total = nights * pricePerNight;

  function isRangeBlocked(ci: string, co: string) {
    if (!ci || !co) return false;
    const days = eachDayOfInterval({ start: parseISO(ci), end: addDays(parseISO(co), -1) });
    return days.some(d => blockedDates.includes(format(d, 'yyyy-MM-dd')));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setError('');
    if (name === 'check_in') { setForm(prev => ({ ...prev, check_in: value, check_out: '' })); return; }
    if (name === 'check_out' && form.check_in && isRangeBlocked(form.check_in, value)) {
      setError(t('blocked')); setForm(prev => ({ ...prev, check_out: '' })); return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  async function sendSmsCode() {
    setSmsError('');
    setSmsLoading(true);
    try {
      const res = await fetch('/api/verify/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.guest_phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCodeSent(true);
      setCountdown(60);
      if (data.testCode) setTestCode(data.testCode);
    } catch (err: unknown) {
      setSmsError(err instanceof Error ? err.message : 'SMS გაგზავნა ვერ მოხდა');
    } finally {
      setSmsLoading(false);
    }
  }

  async function confirmCode() {
    setSmsError('');
    setSmsLoading(true);
    try {
      const res = await fetch('/api/verify/confirm-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.guest_phone, code: smsCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPhoneVerified(true);
      setStep('payment');
    } catch (err: unknown) {
      setSmsError(err instanceof Error ? err.message : 'კოდი არასწორია');
    } finally {
      setSmsLoading(false);
    }
  }

  async function handlePayment() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/checkout/${paymentMethod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cottage_id: cottageId, total_price: total }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'შეცდომა მოხდა');
      window.location.href = data.redirectUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'შეცდომა მოხდა');
    } finally {
      setLoading(false);
    }
  }

  function goToVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (nights <= 0) { setError(t('invalidDates')); return; }
    if (isRangeBlocked(form.check_in, form.check_out)) { setError(t('blocked')); return; }
    setStep('verify');
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500/60 transition-all text-sm";

  const geo = (msg: string) => (e: React.InvalidEvent<HTMLInputElement | HTMLSelectElement>) => {
    (e.target as HTMLInputElement | HTMLSelectElement).setCustomValidity(msg);
  };
  const clearValidity = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    (e.target as HTMLInputElement | HTMLSelectElement).setCustomValidity('');
    handleChange(e);
  };

  // STEP 1: Form
  if (step === 'form') return (
    <form onSubmit={goToVerify} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-white/50 mb-2 block">📅 {t('dates')}</label>
        <DateRangePicker
          checkIn={form.check_in}
          checkOut={form.check_out}
          blockedDates={blockedDates}
          onSelect={(ci, co) => {
            setError('');
            setForm(prev => ({ ...prev, check_in: ci, check_out: co }));
          }}
        />
        {!form.check_in && <p className="text-white/25 text-xs mt-1.5 ml-1">{t('calendarHint')}</p>}
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-2"><Users className="w-3.5 h-3.5" /> {t('guests')}</label>
        <select name="guests_count" value={form.guests_count}
          onChange={clearValidity}
          onInvalid={geo(t('guests'))}
          className={inputClass}>
          {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-[#0a1628]">{n} {t('guestOption')}</option>)}
        </select>
      </div>

      <div className="border-t border-white/10 pt-2" />

      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-2"><User className="w-3.5 h-3.5" /> {t('name')}</label>
        <input type="text" name="guest_name" required placeholder={t('namePlaceholder')}
          value={form.guest_name}
          onChange={clearValidity}
          onInvalid={geo(t('errorName'))}
          className={inputClass} />
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-2"><Mail className="w-3.5 h-3.5" /> {t('email')}</label>
        <input type="email" name="guest_email" required placeholder="example@gmail.com"
          value={form.guest_email}
          onChange={clearValidity}
          onInvalid={geo(t('errorEmail'))}
          className={inputClass} />
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-2"><Phone className="w-3.5 h-3.5" /> {t('phone')}</label>
        <input type="tel" name="guest_phone" required placeholder={t('phonePlaceholder')}
          value={form.guest_phone}
          onChange={clearValidity}
          onInvalid={geo(t('errorPhone'))}
          className={inputClass} />
      </div>

      {nights > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex justify-between text-white/50 text-sm mb-2">
            <span>₾{pricePerNight} × {nights} {t('nights')}</span><span>₾{total}</span>
          </div>
          <div className="flex justify-between font-bold text-white border-t border-white/10 pt-2 mt-2">
            <span>{t('total')}</span><span className="text-green-400 text-xl">₾{total}</span>
          </div>
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

      <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
        {t('nextVerify')} <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );

  // STEP 2: Phone verification
  if (step === 'verify') return (
    <div className="space-y-5">
      <button onClick={() => setStep('form')} className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors">
        {tv('back')}
      </button>

      <div className="text-center py-2">
        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Phone className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-white font-bold text-lg mb-1">{tv('title')}</h3>
        <p className="text-white/40 text-sm">{form.guest_phone}</p>
      </div>

      {testCode && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
          <p className="text-yellow-300 text-xs">🧪 TEST MODE — კოდია: <strong className="text-yellow-200 text-lg">{testCode}</strong></p>
        </div>
      )}

      {!codeSent ? (
        <button onClick={sendSmsCode} disabled={smsLoading}
          className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {smsLoading
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> {tv('sending')}</>
            : <><Phone className="w-4 h-4" /> {tv('sendCode')}</>}
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-white/50 mb-2 block">{tv('code')}</label>
            <input
              type="text" maxLength={6} placeholder="000000"
              value={smsCode} onChange={e => { setSmsCode(e.target.value.replace(/\D/g, '')); setSmsError(''); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-2xl font-bold tracking-widest placeholder-white/20 focus:outline-none focus:border-green-500/60 transition-all"
            />
          </div>

          {smsError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{smsError}</div>}

          <button onClick={confirmCode} disabled={smsLoading || smsCode.length !== 6}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {smsLoading
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> {tv('checking')}</>
              : <>{tv('confirm')} <ArrowRight className="w-4 h-4" /></>}
          </button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-white/30 text-sm">{countdown} {tv('countdown')}</p>
            ) : (
              <button onClick={sendSmsCode} className="text-green-400 hover:text-green-300 text-sm transition-colors">
                {tv('resend')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // STEP 3: Payment
  return (
    <div className="space-y-5">
      <button onClick={() => setStep('verify')} className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors">
        {tv('back')}
      </button>

      <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
        <div>
          <p className="text-green-400 font-semibold text-sm">{tv('verified')}</p>
          <p className="text-white/40 text-xs">{form.guest_phone}</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm space-y-2">
        <div className="flex justify-between text-white/50"><span>{t('checkIn')}</span><span className="text-white">{form.check_in}</span></div>
        <div className="flex justify-between text-white/50"><span>{t('checkOut')}</span><span className="text-white">{form.check_out}</span></div>
        <div className="flex justify-between text-white/50"><span>{t('guests')}</span><span className="text-white">{form.guests_count}</span></div>
        <div className="flex justify-between font-bold border-t border-white/10 pt-2 mt-2">
          <span className="text-white">{t('total')}</span><span className="text-green-400 text-xl">₾{total}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-white/50 mb-3 block">{t('paymentMethod')}</label>
        <div className="grid grid-cols-2 gap-3">
          {(['bog', 'tbc'] as PaymentMethod[]).map(method => (
            <button key={method} type="button" onClick={() => setPaymentMethod(method)}
              className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === method
                  ? method === 'bog' ? 'border-[#EF3340] bg-[#EF3340]/10' : 'border-[#00AEEF] bg-[#00AEEF]/10'
                  : 'border-white/10 bg-white/3 hover:border-white/25'
              }`}>
              {paymentMethod === method && (
                <div className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${method === 'bog' ? 'bg-[#EF3340]' : 'bg-[#00AEEF]'}`}>
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm ${method === 'bog' ? 'bg-[#EF3340]' : 'bg-[#00AEEF]'}`}>
                {method.toUpperCase()}
              </div>
              <span className="text-white/70 text-xs font-medium">{method === 'bog' ? t('bogBank') : t('tbcBank')}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

      <button onClick={handlePayment} disabled={loading}
        className={`w-full text-white py-4 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
          paymentMethod === 'bog' ? 'bg-[#EF3340] hover:bg-[#d42d38] shadow-lg shadow-red-900/30' : 'bg-[#00AEEF] hover:bg-[#0099d4] shadow-lg shadow-blue-900/30'
        }`}>
        {loading
          ? t('loading')
          : <><Lock className="w-4 h-4" />{paymentMethod === 'bog' ? t('bogPay') : t('tbcPay')}<ArrowRight className="w-4 h-4" /></>}
      </button>

      <p className="text-xs text-white/25 text-center">🔒 {paymentMethod === 'bog' ? t('bogSecure') : t('tbcSecure')}</p>
    </div>
  );
}
