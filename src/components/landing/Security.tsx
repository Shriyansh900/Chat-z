'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Shield,
  Lock,
  FileCheck,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

const pillars = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    desc: 'Messages are encrypted on your device before transmission. Only you and the recipient hold the keys.',
    color: 'from-[#5df8d8] to-[#6fd1d7]',
    glow: 'shadow-[#5df8d8]/20',
  },
  {
    icon: Shield,
    title: 'Zero Data Leaks',
    desc: 'No message content is ever stored on our servers. Zero-knowledge architecture by design.',
    color: 'from-[#6fd1d7] to-[#3b7597]',
    glow: 'shadow-[#6fd1d7]/20',
  },
  {
    icon: FileCheck,
    title: 'Secure File Sharing',
    desc: 'Files are encrypted client-side and transferred directly peer-to-peer with integrity checks.',
    color: 'from-[#3b7597] to-[#093c5d]',
    glow: 'shadow-[#3b7597]/20',
  },
  {
    icon: Smartphone,
    title: 'Device Sync',
    desc: 'Sync across all your devices securely. Each device maintains its own encrypted key store.',
    color: 'from-[#093c5d] to-[#3b7597]',
    glow: 'shadow-[#3b7597]/20',
  },
];

const encryptionSteps = [
  { label: 'Message Created', icon: '💬', color: 'bg-slate-700' },
  { label: 'AES-256 Encrypt', icon: '🔐', color: 'bg-[#3b7597]' },
  { label: 'Key Exchange', icon: '🔑', color: 'bg-[#6fd1d7]' },
  { label: 'Secure Transit', icon: '⚡', color: 'bg-[#093c5d]' },
  { label: 'Recipient Decrypts', icon: '✅', color: 'bg-[#5df8d8]' },
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

export default function Security() {
  const { ref, inView } = useInView();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % encryptionSteps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section id="security" className="relative py-28 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#060d14] via-[#093c5d]/30 to-[#060d14]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#6fd1d7]/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border text-xs font-medium text-[#6fd1d7] mb-6">
            <Shield size={12} />
            Military-Grade Security
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Trusted Security, <span className="text-gradient">by Design</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            Every message, every file, every call — protected with the same
            cryptographic standards used by governments and financial
            institutions worldwide.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Encryption flow */}
          <div
            className={`transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
          >
            <div className="glass-card rounded-3xl p-8 border border-[#6fd1d7]/15">
              <div className="text-sm font-semibold text-[#6fd1d7] mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#5df8d8] rounded-full animate-pulse" />
                Live Encryption Flow
              </div>

              <div className="space-y-4">
                {encryptionSteps.map((step, i) => (
                  <div
                    key={step.label}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                      i === activeStep
                        ? 'bg-[#6fd1d7]/10 border border-[#6fd1d7]/30 scale-[1.02]'
                        : i < activeStep
                          ? 'bg-white/[0.03] border border-white/5 opacity-60'
                          : 'bg-white/[0.02] border border-white/[0.03] opacity-30'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center text-lg shrink-0 transition-transform duration-300 ${i === activeStep ? 'scale-110' : ''}`}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {step.label}
                      </div>
                      {i === activeStep && (
                        <div className="text-xs text-[#6fd1d7] mt-0.5 flex items-center gap-1">
                          <div className="w-1 h-1 bg-[#6fd1d7] rounded-full animate-pulse" />
                          Processing...
                        </div>
                      )}
                    </div>
                    {i < activeStep && (
                      <div className="ml-auto">
                        <div className="w-5 h-5 rounded-full bg-[#5df8d8]/20 border border-[#5df8d8]/40 flex items-center justify-center">
                          <span className="text-[#5df8d8] text-xs">✓</span>
                        </div>
                      </div>
                    )}
                    {i === activeStep && (
                      <div className="ml-auto">
                        <ChevronRight
                          size={16}
                          className="text-[#6fd1d7] animate-pulse"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Code snippet */}
              <div className="mt-6 p-4 rounded-xl bg-[#060d14]/80 border border-[#6fd1d7]/10 font-mono text-xs">
                <div className="text-slate-500 mb-2">
                  // Key exchange protocol
                </div>
                <div className="text-[#3b7597]">const</div>
                <span className="text-white"> sharedKey </span>
                <span className="text-slate-400">= await</span>
                <span className="text-[#6fd1d7]"> crypto.subtle</span>
                <span className="text-white">.deriveKey(</span>
                <div className="pl-4">
                  <span className="text-[#5df8d8]">&#123; name: </span>
                  <span className="text-orange-400">&quot;ECDH&quot;</span>
                  <span className="text-[#5df8d8]">, public &#125;</span>
                </div>
                <span className="text-white">);</span>
              </div>
            </div>
          </div>

          {/* Right: Pillars grid */}
          <div
            className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-400 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
          >
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="group glass-card rounded-2xl p-6 border border-[#6fd1d7]/10 hover:border-[#6fd1d7]/30 transition-all duration-300 hover:-translate-y-1 cursor-default"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-lg ${p.glow} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2 leading-tight">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              );
            })}

            {/* Certification badge */}
            <div className="col-span-2 glass-card rounded-2xl p-5 border border-[#6fd1d7]/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5df8d8] to-[#6fd1d7] flex items-center justify-center shrink-0 animate-glow">
                <Shield size={20} className="text-[#060d14]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  SOC 2 Type II Certified
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Audited annually by independent security firms
                </div>
              </div>
              <div className="ml-auto text-xs text-[#5df8d8] font-mono border border-[#5df8d8]/30 rounded-lg px-2 py-1">
                VERIFIED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
