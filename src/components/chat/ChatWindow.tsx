'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import { Message } from '@/types';
import { Loader2, MessageCircle } from 'lucide-react';
import api from '@/lib/axios';
import MessageBubble from './MessageBubble';

function getChatId(chat: Message['chat']): string {
  return typeof chat === 'string' ? chat : chat._id;
}

type FetchState = { loading: boolean; messages: Message[] };
type FetchAction =
  | { type: 'start' }
  | { type: 'done'; messages: Message[] }
  | { type: 'error' };

function fetchReducer(_: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'start':
      return { loading: true, messages: [] };
    case 'done':
      return { loading: false, messages: action.messages };
    case 'error':
      return { loading: false, messages: [] };
  }
}

export default function ChatWindow() {
  const {
    messages: storeMessages,
    setMessages,
    activeChat,
    deleteMessage,
  } = useChatStore();
  const { user } = useAuthStore();

  const [fetchState, dispatch] = useReducer(fetchReducer, {
    loading: false,
    messages: [],
  });
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChatIdRef = useRef<string | null>(null);
  const activeChatIdForSocket = useRef<string | null>(null);
  const currentUserId = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    activeChatIdForSocket.current = activeChat?._id ?? null;
  }, [activeChat?._id]);
  useEffect(() => {
    currentUserId.current = user?._id ?? null;
  }, [user?._id]);

  useEffect(() => {
    if (!fetchState.loading) setMessages(fetchState.messages);
  }, [fetchState]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeChat) return;
    activeChatIdRef.current = activeChat._id;
    const socket = getSocket();
    const joinRoom = () => socket.emit('join_chat', activeChat._id);
    if (socket.connected) joinRoom();
    else socket.once('connect', joinRoom);
    dispatch({ type: 'start' });
    api
      .get(`/messages/${activeChat._id}`)
      .then((res) => {
        if (activeChatIdRef.current !== activeChat._id) return;
        const data = res.data;
        const msgs: Message[] = Array.isArray(data) ? data : data ? [data] : [];
        msgs.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        dispatch({ type: 'done', messages: msgs });
      })
      .catch(() => {
        if (activeChatIdRef.current === activeChat._id)
          dispatch({ type: 'error' });
      });
    return () => {
      socket.off('connect', joinRoom);
    };
  }, [activeChat?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const socket = getSocket();

    const onMessage = (message: Message) => {
      if (message.sender._id === currentUserId.current) return;
      const msgChatId = getChatId(message.chat);
      useChatStore.getState().updateChatLastMessage(msgChatId, message);
      if (msgChatId !== activeChatIdForSocket.current) return;
      const exists = useChatStore
        .getState()
        .messages.some((m) => m._id === message._id);
      if (!exists) useChatStore.getState().addMessage(message);
    };
    const onMessageDeleted = ({
      messageId,
    }: {
      messageId: string;
      chatId: string;
    }) => {
      useChatStore.getState().deleteMessage(messageId);
    };
    const onTyping = ({ chatId }: { chatId: string; userId: string }) => {
      if (chatId !== activeChatIdForSocket.current) return;
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    };
    const onStopTyping = ({ chatId }: { chatId: string; userId: string }) => {
      if (chatId !== activeChatIdForSocket.current) return;
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    const onReconnect = () => {
      if (activeChatIdForSocket.current)
        socket.emit('join_chat', activeChatIdForSocket.current);
    };

    socket.on('receive_message', onMessage);
    socket.on('message_deleted', onMessageDeleted);
    socket.on('typing', onTyping);
    socket.on('stop_typing', onStopTyping);
    socket.on('connect', onReconnect);

    return () => {
      socket.off('receive_message', onMessage);
      socket.off('message_deleted', onMessageDeleted);
      socket.off('typing', onTyping);
      socket.off('stop_typing', onStopTyping);
      socket.off('connect', onReconnect);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      120;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowScrollBtn(false);
    } else setShowScrollBtn(true);
  }, [storeMessages.length]);

  useEffect(() => {
    if (!fetchState.loading)
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [fetchState.loading]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight >= 120);
  };

  const grouped = storeMessages.reduce<Record<string, Message[]>>(
    (acc, msg) => {
      const date = new Date(msg.createdAt).toDateString();
      (acc[date] ??= []).push(msg);
      return acc;
    },
    {},
  );

  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
  );

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#060d14] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#093c5d]/40 border border-[#6fd1d7]/10 flex items-center justify-center">
          <MessageCircle className="w-7 h-7 text-slate-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-400">
            No conversation selected
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Pick a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  if (fetchState.loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#060d14]">
        <Loader2 className="w-5 h-5 animate-spin text-[#6fd1d7]" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 relative"
      style={{
        background:
          'radial-gradient(at 20% 10%, rgba(9,60,93,0.4) 0px, transparent 60%), radial-gradient(at 80% 80%, rgba(9,60,93,0.3) 0px, transparent 50%), #060d14',
      }}
    >
      <div className="flex flex-col gap-4">
        {sortedGroups.length === 0 && (
          <div className="flex items-center justify-center mt-16">
            <p className="text-xs text-slate-600">
              No messages yet. Say hello!
            </p>
          </div>
        )}

        {sortedGroups.map(([date, msgs]) => (
          <div key={date}>
            <div className="flex justify-center my-3">
              <span className="text-[11px] text-slate-500 glass px-3 py-1 rounded-full border border-[#6fd1d7]/10">
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
                  time={new Date(msg.createdAt).toLocaleTimeString([], {
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

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-xs font-bold shrink-0">
              A
            </div>
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center border border-[#6fd1d7]/10">
              <span className="typing-dot w-1.5 h-1.5 bg-[#6fd1d7] rounded-full" />
              <span className="typing-dot w-1.5 h-1.5 bg-[#6fd1d7] rounded-full" />
              <span className="typing-dot w-1.5 h-1.5 bg-[#6fd1d7] rounded-full" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setShowScrollBtn(false);
          }}
          className="absolute bottom-5 right-5 bg-gradient-to-r from-[#5df8d8] to-[#6fd1d7] text-[#060d14] px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg shadow-[#5df8d8]/20 hover:opacity-90 transition-opacity"
        >
          New messages ↓
        </button>
      )}
    </div>
  );
}
