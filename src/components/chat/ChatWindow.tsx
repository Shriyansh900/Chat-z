'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import { Message } from '@/types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  chatId?: string;
}

export default function ChatWindow({ chatId: _chatId }: ChatWindowProps = {}) {
  const { messages, addMessage } = useChatStore();
  const { user } = useAuthStore();
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Socket: receive messages + typing indicators
  useEffect(() => {
    const socket = getSocket();

    socket.on('receive_message', (message: Message) => {
      addMessage(message);
    });

    socket.on('typing', () => setIsTyping(true));
    socket.on('stop_typing', () => setIsTyping(false));

    return () => {
      socket.off('receive_message');
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, [addMessage]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  const grouped = messages.reduce<Record<string, Message[]>>((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    (acc[date] ??= []).push(msg);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-50">
      {Object.entries(grouped).map(([date, msgs]) => (
        <div key={date} className="space-y-3">
          {/* Date divider */}
          <div className="flex items-center justify-center">
            <span className="text-xs text-gray-400 bg-gray-50 px-3">
              {date}
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {msgs.map((msg) => (
              <MessageBubble
                key={msg._id}
                content={msg.content}
                time={new Date(msg.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                isOwn={msg.sender._id === user?._id}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-white border border-gray-100 shadow-sm px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-gray-400 italic">
            typing…
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
