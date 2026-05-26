import { Shield, Zap, Apple, Play } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  Product: ['Features', 'Security', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
  Developers: ['API Docs', 'SDK', 'Webhooks', 'Status', 'GitHub'],
};

const socialLinks = [
  { label: 'X / Twitter', href: '#', char: 'X' },
  { label: 'GitHub', href: '#', char: 'GH' },
  { label: 'LinkedIn', href: '#', char: 'in' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[#6fd1d7]/10 overflow-hidden">
      <div className="absolute inset-0 bg-[#060d14]/40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#6fd1d7]/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Banner */}
        <div className="py-16 border-b border-[#6fd1d7]/10">
          <div className="glass-card rounded-3xl p-8 sm:p-12 border border-[#6fd1d7]/15 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3b7597]/10 via-transparent to-[#5df8d8]/5 rounded-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5df8d8]/10 border border-[#5df8d8]/20 text-[#5df8d8] text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 bg-[#5df8d8] rounded-full animate-pulse" />
                Free to start — no credit card required
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Ready for{' '}
                <span className="text-gradient">Secure Conversations?</span>
              </h2>
              <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                Join over 2 million users who have already made the switch to
                truly private, real-time communication.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold text-[#060d14] bg-gradient-to-r from-[#5df8d8] to-[#6fd1d7] hover:from-[#4ae8c8] hover:to-[#5fc1c7] transition-all duration-300 shadow-xl shadow-[#5df8d8]/30 hover:shadow-[#5df8d8]/50 hover:-translate-y-0.5"
                >
                  <Shield size={16} />
                  Start Chatting Free
                </Link>
                <a
                  href="#"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-semibold text-white glass hover:bg-white/10 transition-all duration-300 border border-[#6fd1d7]/20 hover:border-[#6fd1d7]/40"
                >
                  View Documentation
                </a>
              </div>

              {/* App store badges */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 hover:border-[#6fd1d7]/30 transition-colors group"
                >
                  <Apple size={18} className="text-white" />
                  <div className="text-left">
                    <div className="text-[9px] text-slate-500 leading-none">
                      Download on the
                    </div>
                    <div className="text-xs font-semibold text-white leading-none mt-0.5">
                      App Store
                    </div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 hover:border-[#6fd1d7]/30 transition-colors group"
                >
                  <Play size={16} className="text-white fill-current" />
                  <div className="text-left">
                    <div className="text-[9px] text-slate-500 leading-none">
                      Get it on
                    </div>
                    <div className="text-xs font-semibold text-white leading-none mt-0.5">
                      Google Play
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="py-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#060d14] border border-[#6fd1d7]/30 flex items-center justify-center">
                <Zap size={14} className="text-[#5df8d8]" />
              </div>
              <span className="text-white font-bold text-lg">
                Nex<span className="text-gradient">Chat</span>
              </span>
            </a>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-xs">
              Secure real-time communication powered by Socket.IO and end-to-end
              encryption.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ label, href, char }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass border border-[#6fd1d7]/10 hover:border-[#6fd1d7]/30 flex items-center justify-center text-slate-500 hover:text-[#6fd1d7] transition-all text-[10px] font-bold"
                >
                  {char}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 hover:text-[#6fd1d7] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-[#6fd1d7]/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            © 2026 NexChat Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Shield size={10} className="text-[#6fd1d7]" />
            All communications are end-to-end encrypted
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
