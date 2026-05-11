'use client';

import { Paperclip, Smile, Mic, Heading } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

const EmojiPicker = dynamic(() => import('./EmojiPicker'), { ssr: false });

const TYPING_TIMEOUT = 2000;

export default function ChatInput() {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const { activeChat, addMessage } = useChatStore();
  const { user } = useAuthStore();

  const emitTyping = useCallback(() => {
    if (!activeChat) return;
    const socket = getSocket();

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', activeChat._id);
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stop_typing', activeChat._id);
    }, TYPING_TIMEOUT);
  }, [activeChat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    emitTyping();
  };

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || !activeChat || !user) return;

    setValue('');

    // Stop typing indicator immediately on send
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    getSocket().emit('stop_typing', activeChat._id);

    try {
      const res = await api.post('/messages', {
        chatId: activeChat._id,
        content: trimmed,
      });

      const message = res.data;
      addMessage(message);
      getSocket().emit('send_message', message);
    } catch {
      // Restore input on failure
      setValue(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setValue((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0 relative">
      {/* Emoji picker popup */}
      {showEmoji && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowEmoji(false)}
          />
          <div className="absolute bottom-full right-4 mb-2 z-20 shadow-xl rounded-2xl overflow-hidden">
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>
        </>
      )}

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
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
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
            onClick={() => setShowEmoji((prev) => !prev)}
            className={`transition-colors ${
              showEmoji ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
            }`}
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
