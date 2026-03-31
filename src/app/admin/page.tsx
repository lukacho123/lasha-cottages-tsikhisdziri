'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, Calendar, RefreshCw, Send,
  CheckCircle, XCircle, Clock, TreePine, LogOut,
  Users, TrendingUp, Eye, EyeOff
} from 'lucide-react';

const ADMIN_PASSWORD = 'lasha2024';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  created_at: string;
}

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  status: string;
  created_at: string;
}

interface ChatSession {
  session_id: string;
  last_message: string;
  updated_at: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState(false);

  const [tab, setTab] = useState<'bookings' | 'chat'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_authed');
    if (saved === 'true') setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (tab === 'bookings') fetchBookings();
    if (tab === 'chat') fetchSessions();
  }, [tab, authed]);

  useEffect(() => {
    if (!selectedSession) return;
    fetchMessages(selectedSession);
    const interval = setInterval(() => fetchMessages(selectedSession), 4000);
    return () => clearInterval(interval);
  }, [selectedSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authed', 'true');
      setAuthed(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  }

  function logout() {
    sessionStorage.removeItem('admin_authed');
    setAuthed(false);
    setPassword('');
  }

  async function fetchBookings() {
    setLoading(true);
    const res = await fetch('/api/admin/bookings');
    if (res.ok) setBookings(await res.json());
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'confirmed' | 'cancelled') {
    await fetch('/api/admin/booking-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchBookings();
  }

  async function fetchSessions() {
    const res = await fetch('/api/admin/chat-sessions');
    if (res.ok) setSessions(await res.json());
  }

  async function fetchMessages(sessionId: string) {
    const res = await fetch(`/api/chat/messages?session_id=${sessionId}`);
    if (res.ok) setMessages(await res.json());
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !selectedSession) return;
    await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: selectedSession, text: reply, sender: 'admin' }),
    });
    setReply('');
    fetchMessages(selectedSession);
  }

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.total_price, 0);
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const pending = bookings.filter(b => b.status === 'pending').length;

  // LOGIN screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TreePine className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin პანელი</h1>
            <p className="text-white/40 text-sm mt-1">ციხისძირი კოტეჯები</p>
          </div>

          <form onSubmit={login} className="glass rounded-2xl p-8 space-y-5">
            <div>
              <label className="text-white/50 text-sm mb-2 block">პაროლი</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPassError(false); }}
                  placeholder="შეიყვანე პაროლი"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/60 transition-all pr-10 ${passError ? 'border-red-500/50' : 'border-white/10'}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passError && <p className="text-red-400 text-xs mt-1.5">პაროლი არასწორია</p>}
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all hover:scale-105">
              შესვლა
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ADMIN dashboard
  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Sidebar + main layout */}
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <aside className="w-64 bg-[#060e1c] border-r border-white/5 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Admin</p>
                <p className="text-white/30 text-xs">ციხისძირი</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === 'bookings' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Calendar className="w-4 h-4" /> ჯავშნები
              {pending > 0 && <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">{pending}</span>}
            </button>
            <button
              onClick={() => setTab('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === 'chat' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <MessageCircle className="w-4 h-4" /> ჩატი
              {sessions.length > 0 && <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{sessions.length}</span>}
            </button>
          </nav>

          <div className="p-4 border-t border-white/5">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" /> გამოსვლა
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0a1628]/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">
              {tab === 'bookings' ? 'ჯავშნები' : 'ჩატი'}
            </h1>
            <button
              onClick={() => tab === 'bookings' ? fetchBookings() : fetchSessions()}
              className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> განახლება
            </button>
          </div>

          <div className="p-8">
            {/* BOOKINGS TAB */}
            {tab === 'bookings' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: Calendar, label: 'სულ ჯავშანი', value: bookings.length, color: 'from-blue-500 to-indigo-600' },
                    { icon: CheckCircle, label: 'დადასტურებული', value: confirmed, color: 'from-green-500 to-emerald-600' },
                    { icon: TrendingUp, label: 'შემოსავალი', value: `₾${totalRevenue}`, color: 'from-amber-500 to-orange-600' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="glass rounded-2xl p-5">
                      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-white/40 text-xs mb-1">{label}</p>
                      <p className="text-2xl font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                {loading && <p className="text-white/30 text-center py-12">იტვირთება...</p>}
                {!loading && bookings.length === 0 && (
                  <div className="text-center py-20 text-white/20">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>ჯავშნები არ არის</p>
                  </div>
                )}

                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="glass rounded-2xl p-5 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-sm">
                            {b.guest_name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{b.guest_name}</p>
                            <p className="text-white/40 text-xs">{b.guest_email} · {b.guest_phone}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          b.status === 'confirmed' ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                          b.status === 'cancelled' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                          'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {b.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> :
                           b.status === 'cancelled' ? <XCircle className="w-3 h-3" /> :
                           <Clock className="w-3 h-3" />}
                          {b.status === 'confirmed' ? 'დადასტურებული' : b.status === 'cancelled' ? 'გაუქმებული' : 'მოლოდინში'}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/3 rounded-xl p-3">
                          <p className="text-white/30 text-xs mb-1">შემოსვლა</p>
                          <p className="text-white text-sm font-medium">{b.check_in}</p>
                        </div>
                        <div className="bg-white/3 rounded-xl p-3">
                          <p className="text-white/30 text-xs mb-1">გასვლა</p>
                          <p className="text-white text-sm font-medium">{b.check_out}</p>
                        </div>
                        <div className="bg-white/3 rounded-xl p-3">
                          <p className="text-white/30 text-xs mb-1">სტუმრები</p>
                          <p className="text-white text-sm font-medium flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-400" />{b.guests_count}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <span className="text-green-400 font-bold text-xl">₾{b.total_price}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/25 text-xs mr-2">{new Date(b.created_at).toLocaleDateString('ka-GE')}</span>
                          {b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(b.id, 'confirmed')}
                                className="flex items-center gap-1.5 bg-green-500/15 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> დადასტურება
                              </button>
                              <button
                                onClick={() => updateStatus(b.id, 'cancelled')}
                                className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" /> გაუქმება
                              </button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(b.id, 'cancelled')}
                              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" /> გაუქმება
                            </button>
                          )}
                          {b.status === 'cancelled' && (
                            <button
                              onClick={() => updateStatus(b.id, 'confirmed')}
                              className="flex items-center gap-1.5 bg-green-500/15 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> აღდგენა
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* CHAT TAB */}
            {tab === 'chat' && (
              <div className="grid grid-cols-3 gap-4 h-[calc(100vh-160px)]">
                {/* Sessions */}
                <div className="glass rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="font-semibold text-sm text-white/60">საუბრები</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {sessions.length === 0 && (
                      <div className="text-center py-12 text-white/20 text-sm">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        შეტყობინება არ არის
                      </div>
                    )}
                    {sessions.map((s) => (
                      <button
                        key={s.session_id}
                        onClick={() => setSelectedSession(s.session_id)}
                        className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${selectedSession === s.session_id ? 'bg-green-500/10 border-l-2 border-l-green-500' : ''}`}
                      >
                        <p className="text-xs font-mono text-white/30 mb-1">{s.session_id.slice(0, 12)}...</p>
                        <p className="text-sm text-white/70 truncate">{s.last_message}</p>
                        <p className="text-xs text-white/25 mt-1">{new Date(s.updated_at).toLocaleString('ka-GE')}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat window */}
                <div className="col-span-2 glass rounded-2xl flex flex-col overflow-hidden">
                  {!selectedSession ? (
                    <div className="flex-1 flex items-center justify-center text-white/20">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>სესია აირჩიე</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 border-b border-white/5">
                        <p className="text-white/50 text-sm">სესია: <span className="font-mono text-white/30">{selectedSession.slice(0, 20)}...</span></p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-5 space-y-3">
                        {messages.map((m) => (
                          <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${m.sender === 'admin' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-white/8 border border-white/10 text-white/80'}`}>
                              <p>{m.text}</p>
                              <p className="text-xs opacity-50 mt-1">{new Date(m.created_at).toLocaleTimeString('ka-GE')}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={bottomRef} />
                      </div>
                      <form onSubmit={sendReply} className="p-4 border-t border-white/5 flex gap-3">
                        <input
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="პასუხი..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-green-500/50 transition-all"
                        />
                        <button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-full hover:from-green-400 hover:to-emerald-500 transition-all flex items-center gap-2 text-sm font-medium">
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
