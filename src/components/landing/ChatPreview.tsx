'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Shield,
  Phone,
  Video,
  MoreHorizontal,
  Heart,
  ThumbsUp,
  Smile,
  Search,
  Plus,
  Send,
} from 'lucide-react';

const conversations = [
  {
    id: 1,
    name: 'Alice Morgan',
    preview: 'Love the new UI!',
    time: '2m',
    unread: 3,
    online: true,
    avatar: 'AM',
  },
  {
    id: 2,
    name: '#design-team',
    preview: 'Check out the mockups',
    time: '15m',
    unread: 0,
    online: true,
    avatar: 'DT',
    isGroup: true,
  },
  {
    id: 3,
    name: 'Bob Chen',
    preview: "Sounds good, let's do it",
    time: '1h',
    unread: 0,
    online: false,
    avatar: 'BC',
  },
  {
    id: 4,
    name: '#engineering',
    preview: 'Deploy is live 🚀',
    time: '2h',
    unread: 0,
    online: true,
    avatar: 'EN',
    isGroup: true,
  },
  {
    id: 5,
    name: 'Sarah Kim',
    preview: 'Can we schedule a call?',
    time: '3h',
    unread: 1,
    online: true,
    avatar: 'SK',
  },
];

const messages = [
  {
    id: 1,
    sender: 'Alice Morgan',
    avatar: 'AM',
    text: "Hey! I just tested the new encryption — it's incredibly fast!",
    time: '10:22 AM',
    own: false,
    reactions: [{ emoji: '❤️', count: 2 }],
  },
  {
    id: 2,
    sender: 'You',
    avatar: 'YO',
    text: 'Right? Sub-50ms latency with full E2EE. Socket.IO is doing work 💪',
    time: '10:23 AM',
    own: true,
    reactions: [],
  },
  {
    id: 3,
    sender: 'Alice Morgan',
    avatar: 'AM',
    text: 'The file sharing too — I sent a 4K video and it was instant.',
    time: '10:24 AM',
    own: false,
    reactions: [{ emoji: '👍', count: 1 }],
  },
  {
    id: 4,
    sender: 'You',
    avatar: 'YO',
    text: "That's the P2P WebRTC pipeline. All encrypted at the source.",
    time: '10:24 AM',
    own: true,
    reactions: [],
  },
  {
    id: 5,
    sender: 'Alice Morgan',
    avatar: 'AM',
    text: 'This is the future of private communication 🔒',
    time: '10:25 AM',
    own: false,
    reactions: [],
  },
];

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function ChatPreview() {
  const { ref, inView } = useInView();
  const [activeConv, setActiveConv] = useState(1);
  const [inputVal, setInputVal] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setShowTyping(true), 3000);
    const t2 = setTimeout(() => setShowTyping(false), 5200);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [inView]);

  return (
    <section id="preview" className="relative py-28 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#060d14] via-[#093c5d]/20 to-[#060d14]" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#3b7597]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border text-xs font-medium text-[#6fd1d7] mb-6">
            <span className="w-1.5 h-1.5 bg-[#5df8d8] rounded-full animate-pulse" />
            Interactive Preview
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Experience the <span className="text-gradient">Interface</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            A beautifully crafted chat experience with all the features you
            expect, wrapped in seamless, secure communication.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div
          className={`transition-all duration-700 delay-200 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="rounded-3xl glass-card border border-[#6fd1d7]/15 overflow-hidden shadow-2xl shadow-[#060d14]/80 max-w-5xl mx-auto">
            {/* Window controls */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#6fd1d7]/10 bg-[#060d14]/50">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-[#5df8d8]/80" />
              <div className="mx-auto flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                <Shield size={10} className="text-[#6fd1d7]" />
                <span className="text-xs text-slate-500 font-mono">
                  nexchat.io — End-to-End Encrypted
                </span>
              </div>
            </div>

            <div className="flex h-[520px]">
              {/* Sidebar */}
              <div className="w-72 border-r border-[#6fd1d7]/10 flex flex-col bg-[#060d14]/30 shrink-0">
                <div className="p-4 border-b border-[#6fd1d7]/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                      <Search size={12} className="text-slate-500" />
                      <span className="text-xs text-slate-600">
                        Search messages...
                      </span>
                    </div>
                    <button className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5df8d8] to-[#6fd1d7] flex items-center justify-center shrink-0">
                      <Plus size={14} className="text-[#060d14]" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConv(conv.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                        activeConv === conv.id
                          ? 'bg-[#6fd1d7]/10 border border-[#6fd1d7]/20'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            conv.isGroup
                              ? 'bg-gradient-to-br from-[#3b7597] to-[#093c5d]'
                              : 'bg-gradient-to-br from-[#6fd1d7] to-[#3b7597]'
                          }`}
                        >
                          {conv.avatar.charAt(0)}
                        </div>
                        {conv.online && !conv.isGroup && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#5df8d8] rounded-full border border-[#060d14]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate">
                            {conv.name}
                          </span>
                          <span className="text-[10px] text-slate-600 shrink-0 ml-1">
                            {conv.time}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.preview}
                        </div>
                      </div>
                      {conv.unread > 0 && (
                        <div className="w-4 h-4 rounded-full bg-[#5df8d8] flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-[#060d14]">
                            {conv.unread}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main chat */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-[#6fd1d7]/10 flex items-center gap-3 bg-[#060d14]/20">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-xs font-bold text-white">
                      AM
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#5df8d8] rounded-full border border-[#060d14]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Alice Morgan
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#5df8d8]">
                      <span className="w-1 h-1 bg-[#5df8d8] rounded-full" />
                      Active now
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors">
                      <Phone size={13} className="text-slate-400" />
                    </button>
                    <button className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors">
                      <Video size={13} className="text-slate-400" />
                    </button>
                    <button className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors">
                      <MoreHorizontal size={13} className="text-slate-400" />
                    </button>
                    <div className="ml-1 px-2 py-0.5 rounded-full bg-[#5df8d8]/10 border border-[#5df8d8]/20 text-[#5df8d8] text-[10px] font-medium flex items-center gap-1">
                      <Shield size={8} />
                      E2EE
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 items-end group ${msg.own ? 'flex-row-reverse' : ''}`}
                      onMouseEnter={() => setHoveredMsg(msg.id)}
                      onMouseLeave={() => setHoveredMsg(null)}
                    >
                      {!msg.own && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1">
                          {msg.avatar.charAt(0)}
                        </div>
                      )}
                      <div className="max-w-[70%] space-y-1">
                        <div
                          className={`relative rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            msg.own
                              ? 'bg-gradient-to-br from-[#3b7597] to-[#060d14] text-white rounded-br-sm'
                              : 'glass text-slate-200 rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                          {hoveredMsg === msg.id && (
                            <div
                              className={`absolute -top-8 ${msg.own ? 'right-0' : 'left-0'} flex items-center gap-1 glass rounded-xl p-1 border border-[#6fd1d7]/20 shadow-lg z-10`}
                            >
                              {[Heart, ThumbsUp, Smile].map((Icon, i) => (
                                <button
                                  key={i}
                                  className="p-1.5 hover:bg-[#6fd1d7]/20 rounded-lg transition-colors"
                                >
                                  <Icon
                                    size={12}
                                    className="text-slate-400 hover:text-[#6fd1d7]"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {msg.reactions.length > 0 && (
                          <div
                            className={`flex gap-1 ${msg.own ? 'justify-end' : ''}`}
                          >
                            {msg.reactions.map((r) => (
                              <span
                                key={r.emoji}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                              >
                                {r.emoji} {r.count}
                              </span>
                            ))}
                          </div>
                        )}
                        <div
                          className={`text-[10px] text-slate-600 ${msg.own ? 'text-right' : ''}`}
                        >
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}

                  {showTyping && (
                    <div className="flex gap-3 items-end message-animate">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        A
                      </div>
                      <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                        <span className="typing-dot w-1.5 h-1.5 bg-[#6fd1d7] rounded-full" />
                        <span className="typing-dot w-1.5 h-1.5 bg-[#6fd1d7] rounded-full" />
                        <span className="typing-dot w-1.5 h-1.5 bg-[#6fd1d7] rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="px-5 py-4 border-t border-[#6fd1d7]/10">
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors">
                      <Plus size={14} className="text-slate-400" />
                    </button>
                    <div className="flex-1 glass rounded-xl px-4 py-2.5 flex items-center gap-2 border border-[#6fd1d7]/10 focus-within:border-[#6fd1d7]/30 transition-colors">
                      <input
                        type="text"
                        placeholder="Encrypted message..."
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none"
                      />
                      <Smile size={14} className="text-slate-500 shrink-0" />
                    </div>
                    <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5df8d8] to-[#6fd1d7] flex items-center justify-center shrink-0 shadow-lg shadow-[#5df8d8]/25 hover:shadow-[#5df8d8]/40 transition-all hover:scale-105">
                      <Send size={14} className="text-[#060d14]" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 ml-11">
                    <Shield size={9} className="text-[#6fd1d7]" />
                    <span className="text-[10px] text-slate-600">
                      Messages are end-to-end encrypted. NexChat cannot read
                      them.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
