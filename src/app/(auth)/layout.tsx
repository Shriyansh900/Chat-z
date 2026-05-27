
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { Zap } from 'lucide-react';

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
        <header className="flex items-center justify-between px-6 py-4 ">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#060d14] border border-[#6fd1d7]/30 flex items-center justify-center">
              <Zap size={14} className="text-[#5df8d8]" />
            </div>
            <span className="text-white font-bold text-lg">
              Chat-<span className="text-gradient">z</span>
            </span>
          </Link>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <div className="w-full md:w-[600px] lg:[800px]  glass-card rounded-3xl border border-[#6fd1d7]/15 shadow-2xl shadow-[#060d14]/80 overflow-hidden">
            



              {/* Right — form */}
              <div className="p-6 sm:p-10 text-white">{children}</div>
            
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
