'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import { Message } from '@/types';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  chatId?: string;
}

export default function ChatWindow({ chatId: _chatId }: ChatWindowProps = {}) {
  const { messages, addMessage, setMessages, activeChat } = useChatStore();
  const { user } = useAuthStore();
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Fetch messages when active chat changes ───────────────
  useEffect(() => {
    if (!activeChat) return;

    setLoadingMessages(true);
    setMessages([]); // clear previous chat messages immediately

    api
      .get(`/messages/${activeChat._id}`)
      .then((res) => {
        const data = res.data;
        setMessages(Array.isArray(data) ? data : data ? [data] : []);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [activeChat?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Socket: real-time messages + typing ──────────────────
  useEffect(() => {
    const socket = getSocket();

    socket.on('receive_message', (message: Message) => {
      // Only add if it belongs to the active chat
      if (message.chat === activeChat?._id) {
        addMessage(message);
      }
    });
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop_typing', () => setIsTyping(false));

    return () => {
      socket.off('receive_message');
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, [addMessage, activeChat?._id]);

  // ── Auto-scroll to bottom ─────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Group messages by date ────────────────────────────────
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

  // ── Empty state ───────────────────────────────────────────
  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
        <p className="text-sm text-gray-400">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────
  if (loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#f0f2f5]">
      <div className="flex flex-col gap-5">
        {/* Empty chat */}
        {Object.keys(grouped).length === 0 && (
          <div className="flex items-center justify-center mt-16">
            <p className="text-xs text-gray-400">No messages yet. Say hello!</p>
          </div>
        )}

        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date} className="flex flex-col gap-2">
            {/* Date divider */}
            <div className="flex items-center justify-center my-1">
              <span className="text-xs text-gray-500 bg-[#f0f2f5] px-3 py-0.5 rounded-full">
                {date}
              </span>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-1">
              {msgs.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  content={msg.content}
                  file={msg.file}
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
            <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm text-xs text-gray-400 italic shadow-sm">
              typing…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
