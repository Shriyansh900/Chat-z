'use client';

import {
  MessageSquare,
  Users,
  LayoutGrid,
  Phone,
  Star,
  AlignJustify,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import NotificationPanel from './NotificationPanel';
import FriendsPanel from './FriendsPanel';

type ActivePanel = 'notifications' | 'friends' | null;

export default function ChatIconRail() {
  const { user } = useAuthStore();
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'U';

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [notifCount, setNotifCount] = useState(0);

  const toggle = (panel: ActivePanel) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  return (
    <>
      <div className="flex flex-col items-center w-[52px] h-full bg-white border-r border-gray-100 py-3 shrink-0 z-50 relative">
        {/* App logo */}
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mb-5">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-0.5 flex-1 w-full px-1">
          {/* Chats */}
          <button
            title="Chats"
            className="w-full h-10 rounded-lg flex items-center justify-center transition-colors bg-blue-50 text-blue-500"
          >
            <MessageSquare className="w-[18px] h-[18px]" />
          </button>

          {/* Friends / Contacts */}
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

          {/* Other static icons */}
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

          {/* Bell with badge */}
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

        {/* Bottom: hamburger + avatar */}
        <div className="flex flex-col items-center gap-2 mt-auto">
          <button className="w-full h-9 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <AlignJustify className="w-[18px] h-[18px]" />
          </button>
          <div className="relative">
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
          </div>
        </div>
      </div>

      {/* Panels */}
      <NotificationPanel
        open={activePanel === 'notifications'}
        onClose={() => setActivePanel(null)}
        onCountChange={setNotifCount}
      />
      <FriendsPanel
        open={activePanel === 'friends'}
        onClose={() => setActivePanel(null)}
      />
    </>
  );
}
