'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * Wraps auth pages (login / signup).
 * If the user already has a valid access token, redirect them to /chat.
 * Renders nothing until the store has hydrated to avoid a flash.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, _hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hydrated && accessToken) {
      router.replace('/chat');
    }
  }, [_hydrated, accessToken, router]);

  // While hydrating, show nothing (avoids flash of login form for authed users)
  if (!_hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060d14]">
        <div className="w-6 h-6 border-2 border-[#6fd1d7]/40 border-t-[#5df8d8] rounded-full animate-spin" />
      </div>
    );
  }

  // Already authed — render nothing while redirect fires
  if (accessToken) return null;

  return <>{children}</>;
}
