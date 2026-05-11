import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';

interface ChatDetailPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { chatId } = await params;

  return (
    <>
      <ChatWindow chatId={chatId} />
      <ChatInput />
    </>
  );
}
