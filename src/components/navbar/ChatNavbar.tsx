'use client';

import { Search, Phone, Video, MoreHorizontal, X } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export default function ChatNavbar() {
  const { activeChat } = useChatStore();
  const { user } = useAuthStore();

  const chatPartner = activeChat?.users.find((u) => u._id !== user?._id);
  const displayName = activeChat?.isGroup
    ? 'Group Chat'
    : (chatPartner?.username ?? 'Select a chat');
  const avatarInitials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center gap-3 px-4 h-[52px] bg-white border-b border-gray-100 shrink-0">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0 overflow-hidden">
        {chatPartner?.avatar ? (
          <img
            src={chatPartner.avatar}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          avatarInitials
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {displayName}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5">
        {[
          { icon: Search, label: 'Search' },
          { icon: Phone, label: 'Call' },
          { icon: Video, label: 'Video' },
          { icon: MoreHorizontal, label: 'More' },
          { icon: X, label: 'Close' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={label}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </header>
  );
}
