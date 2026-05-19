import { create } from 'zustand';
import { Chat, Message } from '@/types';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  sidebarOpen: boolean;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chat: Chat) => void;
  clearActiveChat: () => void;
  removeChat: (chatId: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  deleteMessage: (messageId: string) => void;
  updateChatLastMessage: (chatId: string, message: Message) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChat: null,
  messages: [],
  sidebarOpen: true,
  setChats: (chats) => set({ chats }),
  setActiveChat: (activeChat) => set({ activeChat }),
  clearActiveChat: () => set({ activeChat: null, messages: [] }),
  removeChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((c) => c._id !== chatId),
      // Also clear active chat if the removed chat was open
      activeChat: state.activeChat?._id === chatId ? null : state.activeChat,
      messages: state.activeChat?._id === chatId ? [] : state.messages,
    })),
  setMessages: (messages) => set({ messages }),
  addMessage: (message: Message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  deleteMessage: (messageId: string) =>
    set((state) => ({
      messages: state.messages.filter((m) => m._id !== messageId),
    })),
  updateChatLastMessage: (chatId: string, message: Message) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id === chatId
          ? { ...c, lastMessage: message, updatedAt: message.createdAt }
          : c,
      ),
    })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
