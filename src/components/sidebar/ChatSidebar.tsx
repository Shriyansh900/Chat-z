'use client';

import { Search, MoreHorizontal, Plus, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import api from '@/lib/axios';

const tabs = ['Chats', 'Channels', 'Direct', 'Groups'];

export default function ChatSidebar() {
  const {
    sidebarOpen,
    chats,
    setChats,
    setActiveChat,
    setMessages,
    activeChat,
  } = useChatStore();
  const { user } = useAuthStore();

  // Fetch chats on mount
  useEffect(() => {
    api
      .get('/chats')
      .then((res) => setChats(res.data))
      .catch(() => {});
  }, [setChats]);

  const handleSelectChat = async (chatId: string) => {
    const chat = chats.find((c) => c._id === chatId);
    if (!chat) return;
    setActiveChat(chat);
    try {
      const res = await api.get(`/messages/${chatId}`);
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-300 overflow-hidden shrink-0',
        sidebarOpen ? 'w-72' : 'w-0',
      )}
    >
      <div className="w-72 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h1 className="text-lg font-semibold text-gray-900">Chats</h1>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search chats..."
              className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none w-full"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                tab === 'Chats'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-500 hover:bg-gray-100',
              )}
            >
              {tab}
            </button>
          ))}
          <button className="ml-auto text-gray-400 hover:text-gray-600">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 && (
            <p className="text-xs text-gray-400 text-center mt-8">
              No chats yet
            </p>
          )}
          {chats.map((chat) => {
            const partner = chat.users.find((u) => u._id !== user?._id);
            const displayName = chat.isGroup
              ? 'Group'
              : (partner?.username ?? 'Unknown');
            const initials = displayName.slice(0, 2).toUpperCase();
            const isActive = activeChat?._id === chat._id;
            const lastMsg = chat.lastMessage?.content ?? '';
            const lastTime = chat.lastMessage
              ? new Date(chat.updatedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <button
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  isActive ? 'bg-blue-50' : 'hover:bg-gray-50',
                )}
              >
                {partner?.avatar ? (
                  <img
                    src={partner.avatar}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {displayName}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {lastTime}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {lastMsg}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
