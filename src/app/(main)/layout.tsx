'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace('/login');
      return;
    }

    if (user) {
      connectSocket(user._id);
    }

    return () => {
      disconnectSocket();
    };
  }, [accessToken, user, router]);

  if (!accessToken) return null;

  return <div className="flex h-screen">{children}</div>;
}
