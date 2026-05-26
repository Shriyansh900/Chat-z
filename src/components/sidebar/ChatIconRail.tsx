'use client';

import {
  MessageSquare,
  Users,
  LayoutGrid,
  Phone,
  Star,
  AlignJustify,
  Bell,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import NotificationPanel from './NotificationPanel';
import FriendsPanel from './FriendsPanel';
import ProfilePanel from '@/components/profile/ProfilePanel';

type ActivePanel = 'notifications' | 'friends' | null;

export default function ChatIconRail() {
  const { user } = useAuthStore();
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'U';

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggle = (panel: ActivePanel) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  return (
    <>
      <div className="hidden sm:flex flex-col items-center w-[52px] h-full bg-[#060d14] border-r border-[#6fd1d7]/10 py-3 shrink-0 z-50 relative">
        {/* App logo */}
        <div className="w-8 h-8 rounded-lg bg-[#060d14] border border-[#6fd1d7]/30 flex items-center justify-center mb-5">
          <Zap className="w-4 h-4 text-[#5df8d8]" />
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-0.5 flex-1 w-full px-1">
          <button
            title="Chats"
            className="w-full h-10 rounded-lg flex items-center justify-center transition-colors bg-[#6fd1d7]/10 text-[#5df8d8]"
          >
            <MessageSquare className="w-[18px] h-[18px]" />
          </button>

          <button
            title="Friends"
            onClick={() => toggle('friends')}
            className={cn(
              'w-full h-10 rounded-lg flex items-center justify-center transition-colors',
              activePanel === 'friends'
                ? 'bg-[#6fd1d7]/10 text-[#5df8d8]'
                : 'text-slate-500 hover:bg-[#6fd1d7]/5 hover:text-slate-300',
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
              className="w-full h-10 rounded-lg flex items-center justify-center transition-colors text-slate-500 hover:bg-[#6fd1d7]/5 hover:text-slate-300"
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
                ? 'bg-[#6fd1d7]/10 text-[#5df8d8]'
                : 'text-slate-500 hover:bg-[#6fd1d7]/5 hover:text-slate-300',
            )}
          >
            <Bell className="w-[18px] h-[18px]" />
            {notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-[3px] bg-[#5df8d8] text-[#060d14] text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {notifCount > 99 ? '99+' : notifCount}
              </span>
            )}
          </button>
        </nav>

        {/* Bottom: hamburger + avatar */}
        <div className="flex flex-col items-center gap-2 mt-auto">
          <button className="w-full h-9 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
            <AlignJustify className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => setProfileOpen(true)}
            title="My Profile"
            className="relative focus:outline-none"
          >
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition-opacity border border-[#6fd1d7]/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-xs font-semibold hover:opacity-80 transition-opacity">
                {initials}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#5df8d8] border-2 border-[#060d14] rounded-full" />
          </button>
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
