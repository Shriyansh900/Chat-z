'use client';

import { Paperclip, Smile, Mic, Heading } from 'lucide-react';
import { useState } from 'react';

export default function ChatInput() {
  const [value, setValue] = useState('');

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-2.5 shadow-sm">
        {/* Attachment */}
        <button
          title="Attach file"
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
        />

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            title="Markdown"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Heading className="w-4 h-4" />
          </button>
          <button
            title="Emoji"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            title="Voice message"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
