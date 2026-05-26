'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  Users,
  Video,
  Activity,
  CheckCheck,
  Image,
  Cpu,
  Moon,
  RefreshCw,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'Real-time Messaging',
    desc: 'Instant delivery powered by Socket.IO with sub-50ms latency worldwide.',
    tag: 'Core',
    color: 'from-[#5df8d8] to-[#6fd1d7]',
    size: 'col-span-2 row-span-1',
  },
  {
    icon: Users,
    title: 'Group Chats',
    desc: 'Create encrypted group channels for teams, communities, and projects.',
    tag: 'Social',
    color: 'from-[#6fd1d7] to-[#3b7597]',
    size: 'col-span-1 row-span-1',
  },
  {
    icon: Video,
    title: 'Voice & Video Calling',
    desc: 'Crystal-clear encrypted calls with WebRTC peer-to-peer technology.',
    tag: 'Premium',
    color: 'from-[#3b7597] to-[#093c5d]',
    size: 'col-span-1 row-span-1',
  },
  {
    icon: Activity,
    title: 'Typing Indicators',
    desc: 'Live typing status updates in real time.',
    tag: 'Live',
    color: 'from-[#5df8d8] to-[#3b7597]',
    size: 'col-span-1 row-span-1',
  },
  {
    icon: CheckCheck,
    title: 'Read Receipts',
    desc: 'Know exactly when your message was delivered and read.',
    tag: 'Status',
    color: 'from-[#6fd1d7] to-[#5df8d8]',
    size: 'col-span-1 row-span-1',
  },
  {
    icon: Image,
    title: 'Media Sharing',
    desc: 'Share photos, videos, and files with end-to-end encryption and preview.',
    tag: 'Files',
    color: 'from-[#3b7597] to-[#6fd1d7]',
    size: 'col-span-1 row-span-1',
  },
  {
    icon: Cpu,
    title: 'AI Smart Replies',
    desc: 'Context-aware reply suggestions powered by on-device AI. Privacy-first.',
    tag: 'AI',
    color: 'from-[#5df8d8] to-[#6fd1d7]',
    size: 'col-span-2 row-span-1',
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    desc: 'Beautiful adaptive theming, day or night.',
    tag: 'UX',
    color: 'from-[#093c5d] to-[#3b7597]',
    size: 'col-span-1 row-span-1',
  },
  {
    icon: RefreshCw,
    title: 'Cross-platform Sync',
    desc: 'One account, every device. iOS, Android, Web, Desktop.',
    tag: 'Sync',
    color: 'from-[#6fd1d7] to-[#3b7597]',
    size: 'col-span-1 row-span-1',
  },
];

function useInView(threshold = 0.15) {
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

export default function Features() {
  const { ref, inView } = useInView();

  return (
    <section id="features" className="relative py-28 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#060d14] via-[#060d14] to-[#060d14]" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#3b7597]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-[#5df8d8]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border text-xs font-medium text-[#6fd1d7] mb-6">
            <Zap size={12} />
            Everything You Need
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Packed with <span className="text-gradient">Powerful Features</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            From real-time messaging to AI-powered replies — NexChat has every
            feature you need, all wrapped in military-grade encryption.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group glass-card rounded-2xl p-6 border border-[#6fd1d7]/10 hover:border-[#6fd1d7]/25 hover:-translate-y-1 cursor-default ${feature.size}`}
                style={{
                  transitionDelay: `${i * 60}ms`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms, border-color 0.3s`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${feature.color} text-[#060d14] opacity-80`}
                  >
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>

                <div
                  className={`mt-4 h-px bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
