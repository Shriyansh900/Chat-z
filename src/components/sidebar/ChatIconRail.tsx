'use client';

import { MessageSquare, Users, LayoutGrid, Phone, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: MessageSquare, label: 'Chats', active: true },
  { icon: Users, label: 'Contacts' },
  { icon: LayoutGrid, label: 'Apps' },
  { icon: Phone, label: 'Calls' },
  { icon: Star, label: 'Starred' },
];

export default function ChatIconRail() {
  return (
    <div className="flex flex-col items-center w-14 h-full bg-white border-r border-gray-100 py-3 gap-1 shrink-0">
      {/* App logo */}
      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
        <MessageSquare className="w-5 h-5 text-white" />
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            title={label}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600',
            )}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </nav>

      {/* Avatar at bottom */}
      <div className="mt-auto relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
          S
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
      </div>
    </div>
  );
}
