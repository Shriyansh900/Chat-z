import Carousel from '@/components/auth/ui/CarouselItem';
import { Toaster } from 'react-hot-toast';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-mesh flex flex-col">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(9,60,93,0.95)',
              color: '#e2eaf2',
              borderRadius: '12px',
              fontSize: '14px',
              border: '1px solid rgba(111,209,215,0.2)',
              backdropFilter: 'blur(16px)',
            },
            success: {
              iconTheme: { primary: '#5df8d8', secondary: '#060d14' },
            },
            error: { iconTheme: { primary: '#f87171', secondary: '#060d14' } },
          }}
        />

        {/* Top nav bar */}
        <header className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5df8d8] to-[#6fd1d7] rounded-lg opacity-20 group-hover:opacity-40 transition-opacity blur-sm" />
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#060d14] border border-[#6fd1d7]/30 group-hover:border-[#5df8d8]/50 transition-colors">
                <Zap size={16} className="text-[#5df8d8]" />
              </div>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Nex<span className="text-gradient">Chat</span>
            </span>
          </Link>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-5xl glass-card rounded-3xl border border-[#6fd1d7]/15 shadow-2xl shadow-[#060d14]/80 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left — carousel panel */}
              <div className="hidden md:flex flex-col justify-center items-center p-10 border-r border-[#6fd1d7]/10 relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#093c5d]/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#5df8d8]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col items-center gap-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-white mb-2">
                      Secure. Fast.{' '}
                      <span className="text-gradient">Private.</span>
                    </h2>
                    <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                      Military-grade encryption meets real-time messaging. Your
                      conversations, your keys.
                    </p>
                  </div>

                  <Carousel
                    baseWidth={380}
                    cardHeight={280}
                    autoplay={true}
                    autoplayDelay={3000}
                    pauseOnHover={false}
                    loop={true}
                    round={false}
                  />

                  {/* Trust badges */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {['E2E Encrypted', 'Zero-knowledge', 'Open Source'].map(
                      (badge) => (
                        <span key={badge} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-[#5df8d8] rounded-full" />
                          {badge}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Right — form */}
              <div className="p-8 sm:p-10 text-white">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
