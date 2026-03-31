'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  created_at: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return '';
    const existing = localStorage.getItem('chat_session');
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem('chat_session', id);
    return id;
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !sessionId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [open, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages() {
    const res = await fetch(`/api/chat/messages?session_id=${sessionId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text.trim();
    setText('');
    await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, text: msg, sender: 'user' }),
    });
    fetchMessages();
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat window */}
      {open && (
        <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col" style={{ height: '420px' }}>
          {/* Header */}
          <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="font-semibold text-sm">ციხისძირი კოტეჯები</span>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm pt-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                გამარჯობა! როგორ შეგვიძლია დაგეხმაროთ?
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    m.sender === 'user'
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t bg-white flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="შეტყობინება..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-green-600 hover:bg-green-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
