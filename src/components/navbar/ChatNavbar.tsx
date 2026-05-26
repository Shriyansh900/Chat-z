'use client';

import { Phone, Video, MoreHorizontal, Shield } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import GroupInfoPanel from '@/components/chat/GroupInfoPanel';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface ChatNavbarProps {
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
          'relative w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 overflow-hidden border border-[#6fd1d7]/20',
          isGroup
            ? 'cursor-pointer hover:opacity-80 transition-opacity'
            : 'cursor-default',
        )}
        style={{ background: 'linear-gradient(135deg, #6fd1d7, #3b7597)' }}
      >
        {chatPartner?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={chatPartner.avatar}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          avatarInitials
        )}
        {/* Online indicator */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5df8d8] border-2 border-[#0a1929] rounded-full" />
      </button>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => isGroup && setGroupPanelOpen((v) => !v)}
          disabled={!isGroup}
          className={cn(
            'text-sm font-semibold text-white truncate text-left w-full block',
            isGroup
              ? 'hover:text-[#5df8d8] transition-colors cursor-pointer'
              : 'cursor-default',
          )}
        >
          {displayName}
        </button>
        {activeChat && (
          <div className="flex items-center gap-1 text-[11px] text-[#5df8d8]">
            <span className="w-1 h-1 bg-[#5df8d8] rounded-full" />
            Active now
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {[
          { icon: Phone, label: 'Call' },
          { icon: Video, label: 'Video' },
          { icon: MoreHorizontal, label: 'More' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={label}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-[#6fd1d7]/10 hover:text-[#6fd1d7] transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        {/* E2EE badge */}
        <div className="hidden sm:flex items-center gap-1 ml-1 px-2 py-1 rounded-full bg-[#5df8d8]/10 border border-[#5df8d8]/20 text-[#5df8d8] text-[10px] font-medium">
          <Shield className="w-3 h-3" />
          E2EE
        </div>
      </div>
    </>
  );

  return (
    <>
      {embedded ? (
        <div className="flex items-center gap-3 w-full">{inner}</div>
      ) : (
        <header className="flex items-center gap-3 px-4 h-[52px] bg-[#0a1929] border-b border-[#6fd1d7]/10 shrink-0">
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
