'use client';

import { Search, Phone, Video, MoreHorizontal, X } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import GroupInfoPanel from '@/components/chat/GroupInfoPanel';

interface ChatNavbarProps {
  /** When true, renders without the outer <header> wrapper (used in mobile layout) */
  embedded?: boolean;
}

export default function ChatNavbar({ embedded = false }: ChatNavbarProps) {
  const { activeChat } = useChatStore();
  const { user } = useAuthStore();
  const [groupPanelOpen, setGroupPanelOpen] = useState(false);

  const chatPartner = activeChat?.users.find((u) => u._id !== user?._id);
  const displayName = activeChat?.isGroup
    ? (activeChat.name ?? 'Group Chat')
    : (chatPartner?.username ?? 'Select a chat');
  const avatarInitials = displayName.slice(0, 2).toUpperCase();
  const isGroup = activeChat?.isGroup ?? false;

  const inner = (
    <>
      {/* Avatar */}
      <button
        onClick={() => isGroup && setGroupPanelOpen((v) => !v)}
        disabled={!isGroup}
        className={cn(
          'w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0 overflow-hidden',
          isGroup
            ? 'cursor-pointer hover:opacity-80 transition-opacity'
            : 'cursor-default',
        )}
      >
        {chatPartner?.avatar ? (
          <img
            src={chatPartner.avatar}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          avatarInitials
        )}
      </button>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => isGroup && setGroupPanelOpen((v) => !v)}
          disabled={!isGroup}
          className={cn(
            'text-sm font-semibold text-gray-900 truncate text-left w-full',
            isGroup
              ? 'hover:text-blue-600 transition-colors cursor-pointer'
              : 'cursor-default',
          )}
        >
          {displayName}
        </button>
      </div>

      {/* Actions — hide some on mobile */}
      <div className="flex items-center gap-0.5">
        {[
          { icon: Search, label: 'Search', mobileHide: true },
          { icon: Phone, label: 'Call', mobileHide: true },
          { icon: Video, label: 'Video', mobileHide: true },
          { icon: MoreHorizontal, label: 'More', mobileHide: false },
          { icon: X, label: 'Close', mobileHide: true },
        ].map(({ icon: Icon, label, mobileHide }) => (
          <button
            key={label}
            title={label}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors',
              mobileHide && 'hidden sm:flex',
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </>
  );

  return (
    <>
      {embedded ? (
        <div className="flex items-center gap-3 w-full">{inner}</div>
      ) : (
        <header className="flex items-center gap-3 px-4 h-[52px] bg-white border-b border-gray-100 shrink-0">
          {inner}
        </header>
      )}

      {isGroup && activeChat && (
        <GroupInfoPanel
          groupChatId={activeChat._id}
          open={groupPanelOpen}
          onClose={() => setGroupPanelOpen(false)}
        />
      )}
    </>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
