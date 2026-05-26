'use client';

import { useState, useEffect, useRef } from 'react';
import { Shield, ArrowRight, Play, Check, Wifi } from 'lucide-react';
import Link from 'next/link';

const chatMessages = [
  {
    id: 1,
    sender: 'Alice',
    avatar: 'A',
    text: 'Hey! Did you see the new encryption update?',
    time: '10:24 AM',
    own: false,
    delay: 0,
  },
  {
    id: 2,
    sender: 'You',
    avatar: 'Y',
    text: 'Yes! End-to-end encrypted. Nobody can read our messages 🔒',
    time: '10:25 AM',
    own: true,
    delay: 800,
  },
  {
    id: 3,
    sender: 'Alice',
    avatar: 'A',
    text: "That's incredible. Finally a secure chat app!",
    time: '10:25 AM',
    own: false,
    delay: 1800,
  },
  {
    id: 4,
    sender: 'You',
    avatar: 'Y',
    text: 'Real-time too — zero latency ⚡',
    time: '10:26 AM',
    own: true,
    delay: 2800,
  },
];

function FloatingBubble({
  message,
  style,
}: {
  message: string;
  style: string;
}) {
  return (
    <div
      className={`absolute glass rounded-2xl px-4 py-2.5 text-xs text-slate-200 whitespace-nowrap shadow-lg ${style}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-[#5df8d8] rounded-full animate-pulse" />
        {message}
      </div>
    </div>
  );
}

export default function Hero() {
  const [particles, setParticles] = useState<
    {
      id: number;
      left: number;
      duration: number;
      delay: number;
      size: number;
    }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 15,
        size: 1 + Math.random() * 2,
      })),
    );
  }, []);

  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [activeMsg, setActiveMsg] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cycle = () => {
      setVisibleMessages([]);
      setShowTyping(false);
      setActiveMsg(0);

      chatMessages.forEach((msg, idx) => {
        setTimeout(() => {
          setShowTyping(true);
          setTimeout(() => {
            setShowTyping(false);
            setVisibleMessages((prev) => [...prev, msg.id]);
            setActiveMsg(idx + 1);
          }, 600);
        }, msg.delay);
      });
    };

    cycle();
    intervalRef.current = setInterval(cycle, 8000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-mesh pt-20">
      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#6fd1d7]/30 particle-el pointer-events-none"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size * 8}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#093c5d]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#5df8d8]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#093c5d]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center py-16">
        {/* Left — Text */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border text-xs font-medium text-[#6fd1d7]">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#5df8d8] rounded-full animate-pulse" />
              <span
                className="w-1.5 h-1.5 bg-[#5df8d8] rounded-full animate-pulse"
                style={{ animationDelay: '0.3s' }}
              />
              <span
                className="w-1.5 h-1.5 bg-[#5df8d8] rounded-full animate-pulse"
                style={{ animationDelay: '0.6s' }}
              />
            </div>
            Powered by Socket.IO + E2EE
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
            <span className="text-white">Secure</span>
            <br />
            <span className="text-gradient">Real-Time</span>
            <br />
            <span className="text-white">Conversations.</span>
          </h1>

          {/* Sub */}
          <p className="text-lg text-slate-400 leading-relaxed max-w-md">
            Ultra-fast messaging powered by{' '}
            <span className="text-[#6fd1d7] font-medium">Socket.IO</span> with{' '}
            <span className="text-[#5df8d8] font-medium">
              military-grade End-to-End Encryption
            </span>
            . Your messages, your privacy — always.
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            {[
              '256-bit AES Encryption',
              'Zero-knowledge Architecture',
              'Open Source Protocol',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check size={12} className="text-[#5df8d8]" />
                {item}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-[#060d14] bg-gradient-to-r from-[#5df8d8] to-[#6fd1d7] hover:from-[#4ae8c8] hover:to-[#5fc1c7] transition-all duration-300 shadow-xl shadow-[#5df8d8]/30 hover:shadow-[#5df8d8]/50 hover:-translate-y-0.5"
            >
              <Shield size={16} />
              Start Chatting
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <a
              href="#preview"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white glass hover:bg-white/10 transition-all duration-300 border border-[#6fd1d7]/20 hover:border-[#6fd1d7]/40"
            >
              <div className="w-6 h-6 rounded-full bg-[#6fd1d7]/20 flex items-center justify-center group-hover:bg-[#6fd1d7]/30 transition-colors">
                <Play size={10} className="ml-0.5 text-[#6fd1d7]" />
              </div>
              View Demo
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-2">
            {[
              { value: '50ms', label: 'Avg Latency' },
              { value: '99.99%', label: 'Uptime' },
              { value: '2M+', label: 'Active Users' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Chat UI Mockup */}
        <div className="relative flex items-center justify-center">
          {/* <FloatingBubble
            message="Alice is online"
            style="top-4 -left-4 animate-float-slow opacity-80"
          />
          <FloatingBubble
            message="End-to-end encrypted 🔒"
            style="top-12 -right-4 animate-float opacity-70"
          />
          <FloatingBubble
            message="3 new messages"
            style="bottom-20 -left-8 animate-float-fast opacity-75"
          /> */}

          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#093c5d]/20 to-[#5df8d8]/10 blur-2xl" />

          <div className="relative w-full max-w-sm animate-float">
            <div className="rounded-3xl glass-card border border-[#6fd1d7]/20 overflow-hidden shadow-2xl shadow-[#060d14]/80">
              {/* App Header */}
              <div className="px-5 py-4 border-b border-[#6fd1d7]/10 flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#093c5d] to-[#6fd1d7] flex items-center justify-center text-white font-bold text-sm">
                    A
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#5df8d8] rounded-full border-2 border-[#060d14] flex items-center justify-center">
                    <Wifi size={6} className="text-[#060d14]" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Alice Morgan
                  </div>
                  <div className="text-xs text-[#5df8d8] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#5df8d8] rounded-full" />
                    Online now
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div className="px-2 py-0.5 rounded-full bg-[#5df8d8]/10 border border-[#5df8d8]/20 text-[#5df8d8] text-[10px] font-medium flex items-center gap-1">
                    <Shield size={8} />
                    E2EE
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="px-4 py-4 space-y-3 min-h-[280px] overflow-hidden">
                {chatMessages.map((msg) =>
                  visibleMessages.includes(msg.id) ? (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 items-end message-animate ${msg.own ? 'flex-row-reverse' : ''}`}
                    >
                      {!msg.own && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#093c5d] to-[#6fd1d7] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {msg.avatar}
                        </div>
                      )}
                      <div className="max-w-[78%] space-y-1">
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                            msg.own
                              ? 'bg-gradient-to-br from-[#093c5d] to-[#060d14] text-white rounded-br-sm'
                              : 'glass text-slate-200 rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div
                          className={`text-[10px] text-slate-600 ${msg.own ? 'text-right' : ''}`}
                        >
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ) : null,
                )}

                {/* Typing indicator */}
                {showTyping && activeMsg < chatMessages.length && (
                  <div className="flex gap-2.5 items-end message-animate">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#093c5d] to-[#6fd1d7] flex items-center justify-center text-white text-xs font-bold shrink-0">
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

              {/* Input Bar */}
              <div className="px-4 py-3 border-t border-[#6fd1d7]/10 flex items-center gap-2">
                <div className="flex-1 glass rounded-xl px-3.5 py-2.5 text-xs text-slate-500 flex items-center">
                  Type a message...
                </div>
                <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5df8d8] to-[#6fd1d7] flex items-center justify-center shadow-lg shadow-[#5df8d8]/30 hover:shadow-[#5df8d8]/50 transition-all">
                  <ArrowRight size={14} className="text-[#060d14] font-bold" />
                </button>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060d14] to-transparent pointer-events-none" />
    </section>
  );
}
