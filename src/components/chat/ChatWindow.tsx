'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import { Message } from '@/types';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import MessageBubble from './MessageBubble';

// Resolve chat ID from message — backend may send chat as string or populated object
function getChatId(chat: Message['chat']): string {
  return typeof chat === 'string' ? chat : chat._id;
}

export default function ChatWindow() {
  const { messages, setMessages, activeChat, deleteMessage } = useChatStore();
  const { user } = useAuthStore();
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Ref tracks the currently loaded chat ID to guard in-flight responses
  const activeChatIdRef = useRef<string | null>(null);

  // ── Fetch messages + join socket room when active chat changes ──
  useEffect(() => {
    if (!activeChat) return;

    activeChatIdRef.current = activeChat._id;
    setMessages([]);
    setLoadingMessages(true);

    // Join the socket room so we receive messages for this chat
    getSocket().emit('join_chat', activeChat._id);

    api
      .get(`/messages/${activeChat._id}`)
      .then((res) => {
        if (activeChatIdRef.current !== activeChat._id) return; // stale
        const data = res.data;
        setMessages(Array.isArray(data) ? data : data ? [data] : []);
      })
      .catch(() => {
        if (activeChatIdRef.current === activeChat._id) setMessages([]);
      })
      .finally(() => {
        if (activeChatIdRef.current === activeChat._id)
          setLoadingMessages(false);
      });
  }, [activeChat?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Socket listeners — registered once, read store directly to avoid stale closures ──
  const activeChatIdForSocket = useRef<string | null>(null);
  const currentUserId = useRef<string | null>(null);
  activeChatIdForSocket.current = activeChat?._id ?? null;
  currentUserId.current = user?._id ?? null;

  useEffect(() => {
    const socket = getSocket();

    const onMessage = (message: Message) => {
      // Skip own messages — sender already added via addMessage() in ChatInput
      if (message.sender._id === currentUserId.current) return;

      const msgChatId = getChatId(message.chat);

      // Always update the sidebar last-message preview regardless of active chat
      useChatStore.getState().updateChatLastMessage(msgChatId, message);

      // Only add to the message list if this chat is currently open
      if (msgChatId !== activeChatIdForSocket.current) return;

      useChatStore.getState().addMessage(message);
    };

    const onTyping = () => setIsTyping(true);
    const onStopTyping = () => setIsTyping(false);

    socket.on('receive_message', onMessage);
    socket.on('typing', onTyping);
    socket.on('stop_typing', onStopTyping);

    return () => {
      socket.off('receive_message', onMessage);
      socket.off('typing', onTyping);
      socket.off('stop_typing', onStopTyping);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset activeChatIdRef on unmount so re-mount always re-fetches
  useEffect(() => {
    return () => {
      activeChatIdRef.current = null;
    };
  }, []);

  // ── Auto-scroll on new messages ──────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

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

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
        <p className="text-sm text-gray-400">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  if (loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 bg-[#f0f2f5]">
      <div className="flex flex-col gap-5">
        {Object.keys(grouped).length === 0 && (
          <div className="flex items-center justify-center mt-16">
            <p className="text-xs text-gray-400">No messages yet. Say hello!</p>
          </div>
        )}

        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date} className="flex flex-col gap-2">
            <div className="flex items-center justify-center my-1">
              <span className="text-xs text-gray-500 bg-[#f0f2f5] px-3 py-0.5 rounded-full">
                {date}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {msgs.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  messageId={msg._id}
                  content={msg.content}
                  file={msg.file}
                  time={new Date(msg.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  isOwn={msg.sender._id === user?._id}
                  onDelete={deleteMessage}
                />
              ))}
            </div>
          </div>
        ))}

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
