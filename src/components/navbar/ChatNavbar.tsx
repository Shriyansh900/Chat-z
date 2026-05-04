'use client';

import {
  ChevronLeft,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

export default function ChatNavbar() {
  const { toggleSidebar, sidebarOpen } = useChatStore();

  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shrink-0">
      {/* Back / toggle sidebar */}
      <button
        onClick={toggleSidebar}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <ChevronLeft
          className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}
        />
      </button>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
        AG
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          Alok Gupta
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
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
