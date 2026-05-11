'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import ChatIconRail from '@/components/sidebar/ChatIconRail';
import ChatSidebar from '@/components/sidebar/ChatSidebar';
import ChatNavbar from '@/components/navbar/ChatNavbar';
import axios from 'axios';
import { BASE_URL } from '@/lib/axios';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, _hydrated, setAccessToken, logout } = useAuthStore();
  const router = useRouter();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (!_hydrated) return;

    async function bootstrap() {
      // Read fresh from store — avoids stale closure
      const currentToken = useAuthStore.getState().accessToken;

      if (currentToken) {
        setBootstrapped(true);
        return;
      }

      // No token in memory — try silent refresh via httpOnly cookie
      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setAccessToken(data.accessToken);
        setBootstrapped(true);
      } catch {
        logout();
        router.replace('/login');
      }
    }

    bootstrap();
  }, [_hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Connect/disconnect socket when auth state changes
  useEffect(() => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && user) {
      connectSocket(user._id);
    }
    return () => {
      disconnectSocket();
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Spinner while bootstrapping
  if (!_hydrated || !bootstrapped) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guard — should never reach here after bootstrap, but safety net
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <ChatIconRail />
      <ChatSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <ChatNavbar />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
