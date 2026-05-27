'use client';

import { useState, useEffect } from 'react';
import { Shield, Menu, X, Zap } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'Preview', href: '#preview' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 glass-dark border-b border-teal-500/10 shadow-lg shadow-[#060d14]/50'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#060d14] border border-[#6fd1d7]/30 flex items-center justify-center">
            <Zap size={14} className="text-[#5df8d8]" />
          </div>
          <span className="text-white font-bold text-lg">
            Chat-<span className="text-gradient">z</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#060d14] bg-gradient-to-r from-[#5df8d8] to-[#6fd1d7] hover:from-[#4ae8c8] hover:to-[#5fc1c7] transition-all duration-300 shadow-lg shadow-[#5df8d8]/20 hover:shadow-[#5df8d8]/40"
          >
            <Shield size={14} />
            Start Free
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 mx-4 rounded-2xl glass-dark border border-[#6fd1d7]/10 overflow-hidden">
          <div className="p-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-white/5 flex flex-col gap-2">
              <Link
                href="/login"
                className="px-4 py-3 text-sm text-center text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-3 text-sm font-semibold text-center text-[#060d14] rounded-xl bg-gradient-to-r from-[#5df8d8] to-[#6fd1d7]"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
