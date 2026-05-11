import { create } from 'zustand';
import { Chat, Message } from '@/types';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  sidebarOpen: boolean;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chat: Chat) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
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
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
