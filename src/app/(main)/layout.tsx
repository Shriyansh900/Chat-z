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
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!accessToken) return null;

  // ── Mobile layout ─────────────────────────────────────────
  if (isMobile) {
    const showChat = !!activeChat;

    return (
      <div className="flex flex-col h-[100dvh] bg-white overflow-hidden">
        {showChat ? (
          // ── Active chat — full screen ──
          <>
            <div className="flex items-center gap-2 px-3 h-[52px] bg-white border-b border-gray-100 shrink-0">
              <button
                onClick={() => clearActiveChat()}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
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
          // ── No active chat — sidebar + bottom tabs ──
          <>
            {/* App header */}
            <div className="flex items-center justify-between px-4 h-[52px] bg-white border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Chat-Z
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
            <div className="flex items-center bg-white border-t border-gray-100 shrink-0 safe-area-bottom">
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
                    mobileTab === id ? 'text-blue-500' : 'text-gray-400',
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {badge && badge > 0 && (
                      <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-[3px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
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
