'use client';

import {
  MessageSquare,
  Users,
  LayoutGrid,
  Phone,
  Star,
  AlignJustify,
  Bell,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationPanel from './NotificationPanel';
import FriendsPanel from './FriendsPanel';
import ProfilePanel from '@/components/profile/ProfilePanel';
import api from '@/lib/axios';
import { disconnectSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';

type ActivePanel = 'notifications' | 'friends' | null;

export default function ChatIconRail() {
  const { user, logout } = useAuthStore();
  const { clearActiveChat } = useChatStore();
  const router = useRouter();
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'U';

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggle = (panel: ActivePanel) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // proceed regardless — clear local state
    } finally {
      disconnectSocket();
      logout();
      clearActiveChat();
      router.replace('/login');
    }
  };

  return (
    <>
      <div className="hidden sm:flex flex-col items-center w-[52px] h-full bg-white border-r border-gray-100 py-3 shrink-0 z-50 relative">
        {/* App logo */}
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mb-5">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-0.5 flex-1 w-full px-1">
          <button
            title="Chats"
            className="w-full h-10 rounded-lg flex items-center justify-center transition-colors bg-blue-50 text-blue-500"
          >
            <MessageSquare className="w-[18px] h-[18px]" />
          </button>

          <button
            title="Friends"
            onClick={() => toggle('friends')}
            className={cn(
              'w-full h-10 rounded-lg flex items-center justify-center transition-colors',
              activePanel === 'friends'
                ? 'bg-blue-50 text-blue-500'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600',
            )}
          >
            <Users className="w-[18px] h-[18px]" />
          </button>

          {[
            { icon: LayoutGrid, label: 'Apps' },
            { icon: Phone, label: 'Calls' },
            { icon: Star, label: 'Starred' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              className="w-full h-10 rounded-lg flex items-center justify-center transition-colors text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              <Icon className="w-[18px] h-[18px]" />
            </button>
          ))}

          <button
            title="Notifications"
            onClick={() => toggle('notifications')}
            className={cn(
              'relative w-full h-10 rounded-lg flex items-center justify-center transition-colors',
              activePanel === 'notifications'
                ? 'bg-blue-50 text-blue-500'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600',
            )}
          >
            <Bell className="w-[18px] h-[18px]" />
            {notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-[3px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {notifCount > 99 ? '99+' : notifCount}
              </span>
            )}
          </button>
        </nav>

        {/* Bottom: hamburger + avatar with logout menu */}
        <div className="flex flex-col items-center gap-2 mt-auto">
          <button className="w-full h-9 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <AlignJustify className="w-[18px] h-[18px]" />
          </button>

          {/* Avatar — click to toggle logout menu */}
          <div className="relative">
            <button
              onClick={() => setShowLogoutMenu((v) => !v)}
              title="Account"
              className="relative focus:outline-none"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-white rounded-full" />
            </button>

            {/* Logout popup */}
            {showLogoutMenu && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setShowLogoutMenu(false)}
                />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[130px]">
                  <div className="px-3 py-1.5 border-b border-gray-50">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {user?.username}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowLogoutMenu(false);
                      setProfileOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircle className="w-3.5 h-3.5" />
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {loggingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <NotificationPanel
        open={activePanel === 'notifications'}
        onClose={() => setActivePanel(null)}
        onCountChange={setNotifCount}
      />
      <FriendsPanel
        open={activePanel === 'friends'}
        onClose={() => setActivePanel(null)}
      />
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
