'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import { useChatStore } from '@/store/chatStore';

interface ChatDetailPageProps {
  params: Promise<{ chatId: string }>;
}

export default function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { chatId } = use(params);
  const router = useRouter();
  const { chats, activeChat, setActiveChat } = useChatStore();

  useEffect(() => {
    // Already the active chat — nothing to do
    if (activeChat?._id === chatId) return;

    // Chats not loaded yet — wait for the next render when they arrive
    if (chats.length === 0) return;

    const chat = chats.find((c) => c._id === chatId);
    if (chat) {
      setActiveChat(chat);
    } else {
      // chatId doesn't exist in the user's chat list — redirect to /chat
      router.replace('/chat');
    }
  }, [chatId, chats, activeChat, setActiveChat, router]);

  return (
    <>
      <ChatWindow />
      <ChatInput />
    </>
  );
}
