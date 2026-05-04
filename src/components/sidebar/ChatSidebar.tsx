'use client';

import { Search, MoreHorizontal, Plus, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';

const tabs = ['Chats', 'Channels', 'Direct', 'Groups'];

const mockChats = [
  {
    id: '1',
    name: 'Alok Gupta',
    avatar: 'AG',
    avatarColor: 'from-blue-500 to-blue-700',
    lastMessage: 'This message has been deleted',
    time: '10:25 PM',
    deleted: true,
    active: true,
  },
];

export default function ChatSidebar() {
  const { sidebarOpen } = useChatStore();

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
              placeholder="Search chats and contacts (ctrl + k)"
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

        {/* Invite banner */}
        <div className="mx-4 mb-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            {/* Stacked avatars */}
            <div className="flex -space-x-2">
              {[
                'from-purple-400 to-purple-600',
                'from-blue-400 to-blue-600',
              ].map((g, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-7 h-7 rounded-full bg-gradient-to-br border-2 border-white flex items-center justify-center text-white text-xs font-semibold',
                    g,
                  )}
                >
                  {i === 0 ? 'A' : 'B'}
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-800">
              Your friends are waiting for you
            </p>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            7260903773, 9122885418, Abhishek Kumar and 14 others are on Arattai
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
            Explore contacts
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {mockChats.map((chat) => (
            <button
              key={chat.id}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                chat.active ? 'bg-blue-50' : 'hover:bg-gray-50',
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-semibold shrink-0',
                  chat.avatarColor,
                )}
              >
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {chat.name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {chat.time}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-xs truncate mt-0.5',
                    chat.deleted ? 'text-gray-400 italic' : 'text-gray-500',
                  )}
                >
                  {chat.deleted && (
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      {chat.lastMessage}
                    </span>
                  )}
                  {!chat.deleted && chat.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
