'use client';

import { useEffect, useRef, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Marcus Rivera',
    role: 'CTO at DataForge',
    avatar:
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
    text: 'We switched our entire company to NexChat six months ago. The encryption is enterprise-grade and the performance is genuinely shocking — faster than Slack with zero compromise on privacy.',
    rating: 5,
    company: 'DataForge',
  },
  {
    id: 2,
    name: 'Sophie Chen',
    role: 'Security Engineer at Vault',
    avatar:
      'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
    text: "I've vetted dozens of messaging platforms. NexChat's cryptographic implementation is the only one I'd trust with classified communications. The Double Ratchet protocol is flawlessly implemented.",
    rating: 5,
    company: 'Vault',
  },
  {
    id: 3,
    name: 'Aiden Park',
    role: 'Founder at Luminary',
    avatar:
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
    text: 'The UI is genuinely beautiful — it feels like a premium product. And knowing our investor conversations are fully private gives us huge peace of mind. Game-changing product.',
    rating: 5,
    company: 'Luminary',
  },
  {
    id: 4,
    name: 'Elena Vasquez',
    role: 'Lead Developer at Pixel Labs',
    avatar:
      'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
    text: 'The Socket.IO real-time performance is extraordinary. I tested it with 200 concurrent users in a group chat — zero lag, full encryption. Nothing else comes close.',
    rating: 5,
    company: 'Pixel Labs',
  },
  {
    id: 5,
    name: 'James Okonkwo',
    role: 'VP Engineering at TechScale',
    avatar:
      'https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
    text: 'Migrating our 500-person engineering org was seamless. The cross-platform sync is flawless — everyone picked it up in minutes. ROI was immediate.',
    rating: 5,
    company: 'TechScale',
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

export default function Testimonials() {
  const { ref, inView } = useInView();
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const navigate = (dir: 'prev' | 'next') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActive((a) =>
        dir === 'next'
          ? (a + 1) % testimonials.length
          : (a - 1 + testimonials.length) % testimonials.length,
      );
      setIsAnimating(false);
    }, 200);
  };

  useEffect(() => {
    const interval = setInterval(() => navigate('next'), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = testimonials[active];

  return (
    <section className="relative py-28 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#060d14] via-[#093c5d]/20 to-[#060d14]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#3b7597]/[0.08] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border text-xs font-medium text-[#6fd1d7] mb-6">
            <Star size={12} className="fill-current" />
            Loved by Thousands
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Trusted by <span className="text-gradient">Teams Worldwide</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Join thousands of teams who have made NexChat their secure
            communication platform of choice.
          </p>
        </div>

        <div
          className={`transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Featured testimonial */}
          <div
            className={`glass-card rounded-3xl p-8 sm:p-10 border border-[#6fd1d7]/15 max-w-3xl mx-auto mb-10 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="text-[#6fd1d7]/40">
                <Quote size={36} />
              </div>
              <div className="flex gap-1 ml-auto">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-[#5df8d8] fill-current"
                  />
                ))}
              </div>
            </div>

            <p className="text-lg text-slate-200 leading-relaxed mb-8 font-light">
              &ldquo;{t.text}&rdquo;
            </p>

            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.avatar}
                alt={t.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#6fd1d7]/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-white font-semibold">{t.name}</div>
                <div className="text-sm text-slate-500">{t.role}</div>
              </div>
              <div className="ml-auto px-3 py-1.5 rounded-lg glass border border-[#6fd1d7]/15 text-xs text-[#6fd1d7]">
                {t.company}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => navigate('prev')}
              className="w-10 h-10 rounded-full glass border border-[#6fd1d7]/20 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#6fd1d7]/40 transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active
                      ? 'w-6 bg-[#5df8d8]'
                      : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => navigate('next')}
              className="w-10 h-10 rounded-full glass border border-[#6fd1d7]/20 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#6fd1d7]/40 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Avatar strip */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((testimonial, i) => (
              <button
                key={testimonial.id}
                onClick={() => setActive(i)}
                className={`transition-all duration-300 rounded-full overflow-hidden border-2 ${
                  i === active
                    ? 'border-[#5df8d8] scale-110'
                    : 'border-transparent opacity-50 hover:opacity-70'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-9 h-9 object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      parent.style.background =
                        'linear-gradient(135deg, #3b7597, #6fd1d7)';
                      parent.style.display = 'flex';
                      parent.style.alignItems = 'center';
                      parent.style.justifyContent = 'center';
                      parent.style.color = 'white';
                      parent.style.fontSize = '12px';
                      parent.style.fontWeight = 'bold';
                      parent.textContent = testimonial.name.charAt(0);
                    }
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
