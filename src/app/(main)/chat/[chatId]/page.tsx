'use client';

import { use } from 'react';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';

interface ChatDetailPageProps {
  params: Promise<{ chatId: string }>;
}

export default function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { chatId } = use(params);

  return (
    <>
      <ChatWindow chatId={chatId} />
      <ChatInput />
    </>
  );
}
