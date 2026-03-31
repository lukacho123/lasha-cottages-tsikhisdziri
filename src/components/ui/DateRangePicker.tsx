'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { ka } from 'date-fns/locale';
import { Calendar, ChevronDown } from 'lucide-react';
import 'react-day-picker/style.css';

interface Props {
  checkIn: string;
  checkOut: string;
  blockedDates: string[];
  onSelect: (checkIn: string, checkOut: string) => void;
}

export default function DateRangePicker({ checkIn, checkOut, blockedDates, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(() =>
    checkIn ? { from: parseISO(checkIn), to: checkOut ? parseISO(checkOut) : undefined } : undefined
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const disabled = [
    { before: new Date() },
    ...blockedDates.map(d => parseISO(d)),
  ];

  function handleSelect(r: DateRange | undefined) {
    setRange(r);
    if (r?.from && r?.to) {
      onSelect(format(r.from, 'yyyy-MM-dd'), format(r.to, 'yyyy-MM-dd'));
      setOpen(false);
    } else if (r?.from) {
      onSelect(format(r.from, 'yyyy-MM-dd'), '');
    }
  }

  const label = () => {
    if (range?.from && range?.to) {
      return `${format(range.from, 'd MMM', { locale: ka })} → ${format(range.to, 'd MMM', { locale: ka })}`;
    }
    if (range?.from) return `${format(range.from, 'd MMM', { locale: ka })} → გასვლა?`;
    return null;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-3 bg-white/5 border rounded-xl px-4 py-3 text-left transition-all ${
          open ? 'border-green-500/60' : 'border-white/10 hover:border-white/25'
        }`}
      >
        <Calendar className="w-4 h-4 text-green-400 shrink-0" />
        <span className={`flex-1 text-sm ${label() ? 'text-white font-medium' : 'text-white/30'}`}>
          {label() ?? 'შემოსვლა → გასვლა'}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 rounded-2xl shadow-2xl shadow-black/60 p-3"
          style={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.1)', minWidth: 320 }}
        >
          <style>{`
            .rdp-root { --rdp-accent-color: #22c55e; --rdp-accent-background-color: rgba(34,197,94,0.2); color: white; }
            .rdp-day { color: rgba(255,255,255,0.75); border-radius: 8px; }
            .rdp-day:hover:not([disabled]) { background: rgba(255,255,255,0.1) !important; color: white; }
            .rdp-selected .rdp-day { background: #22c55e !important; color: white !important; }
            .rdp-range_start .rdp-day, .rdp-range_end .rdp-day { background: #22c55e !important; color: white !important; }
            .rdp-range_middle .rdp-day { background: rgba(34,197,94,0.2) !important; border-radius: 0; color: white; }
            .rdp-day[disabled] { color: rgba(255,255,255,0.15) !important; text-decoration: line-through; pointer-events: none; }
            .rdp-today .rdp-day { color: #4ade80 !important; font-weight: 700; }
            .rdp-caption_label { color: white; font-weight: 600; }
            .rdp-nav button { color: rgba(255,255,255,0.6); background: transparent; border: none; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
            .rdp-nav button:hover { background: rgba(255,255,255,0.1); color: white; }
            .rdp-weekday { color: rgba(255,255,255,0.35); font-size: 12px; }
            .rdp-month_caption { margin-bottom: 8px; }
          `}</style>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            disabled={disabled}
            locale={ka}
            showOutsideDays={false}
          />
          {range?.from && !range?.to && (
            <p className="text-center text-white/40 text-xs pb-2">გასვლის თარიღი აირჩიე</p>
          )}
        </div>
      )}
    </div>
  );
}
