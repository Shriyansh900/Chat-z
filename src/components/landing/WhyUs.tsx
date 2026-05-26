'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Lock, Wifi, Palette, Cloud, Globe } from 'lucide-react';

const reasons = [
  {
    icon: Zap,
    title: 'Blazing Fast Socket.IO',
    desc: 'Real-time bidirectional events with automatic fallback. Messages deliver in under 50ms globally.',
    metric: '< 50ms',
    metricLabel: 'Average latency',
    color: 'from-[#5df8d8] to-[#6fd1d7]',
  },
  {
    icon: Lock,
    title: 'End-to-End Encrypted Channels',
    desc: 'X3DH key agreement and Double Ratchet protocol — the same encryption Signal uses.',
    metric: 'AES-256',
    metricLabel: 'Encryption standard',
    color: 'from-[#6fd1d7] to-[#3b7597]',
  },
  {
    icon: Wifi,
    title: 'Low Latency Architecture',
    desc: 'Edge nodes in 40+ regions. Your messages always take the shortest path to recipients.',
    metric: '40+',
    metricLabel: 'Global edge nodes',
    color: 'from-[#3b7597] to-[#6fd1d7]',
  },
  {
    icon: Palette,
    title: 'Beautiful User Experience',
    desc: 'Meticulously crafted UI inspired by the best messaging apps. Fast, intuitive, delightful.',
    metric: '4.9/5',
    metricLabel: 'User satisfaction',
    color: 'from-[#5df8d8] to-[#3b7597]',
  },
  {
    icon: Cloud,
    title: 'Secure Cloud Sync',
    desc: 'Your encrypted messages sync across all devices. Backed up, never readable by our servers.',
    metric: '99.99%',
    metricLabel: 'Uptime SLA',
    color: 'from-[#6fd1d7] to-[#5df8d8]',
  },
  {
    icon: Globe,
    title: 'Open Source Protocol',
    desc: 'Our cryptographic protocols are fully open source and independently audited.',
    metric: '100%',
    metricLabel: 'Open source',
    color: 'from-[#3b7597] to-[#093c5d]',
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

export default function WhyUs() {
  const { ref, inView } = useInView();

  return (
    <section className="relative py-28 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#060d14] via-[#093c5d]/25 to-[#060d14]" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#6fd1d7]/[0.08] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border text-xs font-medium text-[#6fd1d7] mb-6">
            <Globe size={12} />
            Why NexChat
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Built for the <span className="text-gradient">Modern Web</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            Every architectural decision was made with performance, security,
            and user experience as the non-negotiable pillars.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group glass-card rounded-2xl p-7 border border-[#6fd1d7]/10 hover:border-[#6fd1d7]/25 hover:-translate-y-1 cursor-default"
                style={{
                  transitionDelay: `${i * 80}ms`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms, border-color 0.3s, box-shadow 0.3s`,
                }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}
                    >
                      {item.metric}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      {item.metricLabel}
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.desc}
                </p>

                <div
                  className={`mt-5 h-px bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
