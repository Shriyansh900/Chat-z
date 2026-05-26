'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import ChatIconRail from '@/components/sidebar/ChatIconRail';
import ChatSidebar from '@/components/sidebar/ChatSidebar';
import ChatNavbar from '@/components/navbar/ChatNavbar';
import NotificationPanel from '@/components/sidebar/NotificationPanel';
import FriendsPanel from '@/components/sidebar/FriendsPanel';
import axios from 'axios';
import { BASE_URL } from '@/lib/axios';
import { useChatStore } from '@/store/chatStore';
import { useMobile } from '@/hooks/useMobile';
import { ArrowLeft, Bell, Users, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, _hydrated, setAccessToken, logout, accessToken } =
    useAuthStore();
  const { activeChat, clearActiveChat } = useChatStore();
  const router = useRouter();
  const [bootstrapped, setBootstrapped] = useState(false);
  const isMobile = useMobile();

  const [notifCount, setNotifCount] = useState(0);
  // Mobile tab: 'chats' | 'friends' | 'notifications'
  const [mobileTab, setMobileTab] = useState<
    'chats' | 'friends' | 'notifications'
  >('chats');

  useEffect(() => {
    if (!_hydrated) return;
    async function bootstrap() {
      const currentToken = useAuthStore.getState().accessToken;
      if (currentToken) {
        setBootstrapped(true);
        return;
      }
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

  useEffect(() => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && user) connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!_hydrated || !bootstrapped) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060d14]">
        <div className="w-6 h-6 border-2 border-[#6fd1d7]/40 border-t-[#5df8d8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!accessToken) {
    router.replace('/login');
    return null;
  }

  // ── Mobile layout ─────────────────────────────────────────
  if (isMobile) {
    const showChat = !!activeChat;

    return (
      <div className="flex flex-col h-dvh bg-[#060d14] overflow-hidden">
        {showChat ? (
          <>
            <div className="flex items-center gap-2 px-3 h-[52px] bg-[#0a1929] border-b border-[#6fd1d7]/10 shrink-0">
              <button
                onClick={() => clearActiveChat()}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-[#6fd1d7]/10 hover:text-[#6fd1d7] rounded-lg transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <ChatNavbar embedded />
              </div>
            </div>
            <main className="flex-1 flex flex-col overflow-hidden min-h-0">
              {children}
            </main>
          </>
        ) : (
          <>
            {/* App header */}
            <div className="flex items-center justify-between px-4 h-[52px] bg-[#0a1929] border-b border-[#6fd1d7]/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#060d14] border border-[#6fd1d7]/30 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-[#5df8d8]" />
                </div>
                <span className="text-sm font-bold text-white tracking-tight">
                  Nex<span className="text-gradient">Chat</span>
                </span>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-hidden">
              {mobileTab === 'chats' && <ChatSidebar fullWidth />}
              {mobileTab === 'friends' && (
                <FriendsPanel
                  open={true}
                  onClose={() => setMobileTab('chats')}
                  inline
                />
              )}
              {mobileTab === 'notifications' && (
                <NotificationPanel
                  open={true}
                  onClose={() => setMobileTab('chats')}
                  onCountChange={setNotifCount}
                  inline
                />
              )}
            </div>

            {/* Bottom tab bar */}
            <div className="flex items-center bg-[#0a1929] border-t border-[#6fd1d7]/10 shrink-0">
              {[
                { id: 'chats' as const, icon: MessageSquare, label: 'Chats' },
                { id: 'friends' as const, icon: Users, label: 'Friends' },
                {
                  id: 'notifications' as const,
                  icon: Bell,
                  label: 'Alerts',
                  badge: notifCount,
                },
              ].map(({ id, icon: Icon, label, badge }) => (
                <button
                  key={id}
                  onClick={() => setMobileTab(id)}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors',
                    mobileTab === id ? 'text-[#5df8d8]' : 'text-slate-500',
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {badge && badge > 0 && (
                      <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-[3px] bg-[#5df8d8] text-[#060d14] text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#060d14]">
      <ChatIconRail />
      <ChatSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <ChatNavbar />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
