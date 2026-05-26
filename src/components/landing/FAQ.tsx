'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How does end-to-end encryption work?',
    a: "NexChat uses the X3DH (Extended Triple Diffie-Hellman) key agreement protocol for initial key exchange, combined with the Double Ratchet algorithm for ongoing conversations — the same cryptographic foundation used by Signal. Each message is encrypted on your device using AES-256-GCM before being transmitted, and can only be decrypted by the intended recipient's device. We never have access to your encryption keys.",
  },
  {
    q: 'Is any of my data stored on your servers?',
    a: 'Message content is never stored on our servers in any readable form. We store only the encrypted ciphertext temporarily to enable device-to-device delivery. Once delivered, messages are deleted from our infrastructure. Metadata like timestamps and conversation IDs are stored for sync purposes but are never linked to message content.',
  },
  {
    q: 'Can NexChat administrators read my chats?',
    a: "Absolutely not. This is technically impossible, by design. Our zero-knowledge architecture means that even with full server access, our team cannot decrypt any messages. Your private keys never leave your device. The only way a message can be read is by the device that holds the recipient's private key.",
  },
  {
    q: 'How does device security work with key synchronization?',
    a: "Each new device generates its own cryptographic key pair. When you add a new device, it establishes separate encrypted sessions with each of your contacts via a secure key exchange process. Other devices verify the new device's keys through a safety number comparison. All synchronization is end-to-end encrypted, so your messages remain private even during the sync process.",
  },
  {
    q: 'What happens if I lose my device?',
    a: "You can remotely de-authorize any device from your account dashboard. Once revoked, that device's keys are invalidated and it can no longer decrypt new messages. Your conversation history on that device cannot be accessed by anyone, including us. You can safely provision a new device and restore your account.",
  },
  {
    q: 'Does NexChat work offline?',
    a: "NexChat supports offline message queuing. Messages sent while you're offline are held encrypted on our servers (sender-encrypted, so we can't read them) and delivered when you reconnect. Socket.IO's automatic reconnection ensures seamless recovery without any action required from you.",
  },
];

function FAQItem({
  q,
  a,
  isOpen,
  onClick,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-[#6fd1d7]/30 shadow-lg shadow-[#6fd1d7]/5' : 'border-[#6fd1d7]/10 hover:border-[#6fd1d7]/20'}`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span
          className={`text-sm font-semibold transition-colors duration-200 ${isOpen ? 'text-white' : 'text-slate-200 hover:text-white'}`}
        >
          {q}
        </span>
        <div
          className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#6fd1d7]/20 rotate-180' : 'bg-white/5'}`}
        >
          <ChevronDown
            size={14}
            className={`transition-colors ${isOpen ? 'text-[#6fd1d7]' : 'text-slate-500'}`}
          />
        </div>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{
          maxHeight: isOpen
            ? contentRef.current
              ? `${contentRef.current.scrollHeight}px`
              : '400px'
            : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-[#6fd1d7]/10 pt-4">
          {a}
        </div>
      </div>
    </div>
  );
}

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

export default function FAQ() {
  const { ref, inView } = useInView();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-28 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#060d14] via-[#093c5d]/20 to-[#060d14]" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#6fd1d7]/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border text-xs font-medium text-[#6fd1d7] mb-6">
            <HelpCircle size={12} />
            FAQ
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about how NexChat keeps your
            communications private and secure.
          </p>
        </div>

        <div
          className={`space-y-3 transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              q={faq.q}
              a={faq.a}
              isOpen={openIdx === i}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">Still have questions?</p>
          <a
            href="#"
            className="mt-3 inline-flex items-center gap-2 text-[#6fd1d7] hover:text-[#5df8d8] text-sm font-medium transition-colors"
          >
            Contact our security team
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
