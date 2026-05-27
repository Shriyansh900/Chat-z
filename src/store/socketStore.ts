import { create } from 'zustand';

interface SocketStore {
  connected: boolean;
  /** Set of userIds currently online (friends only, per backend) */
  onlineUsers: Set<string>;
  /** Map of chatId → unread message count */
  unreadCounts: Map<string, number>;
  setConnected: (connected: boolean) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  incrementUnread: (chatId: string) => void;
  clearUnread: (chatId: string) => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  connected: false,
  onlineUsers: new Set(),
  unreadCounts: new Map(),
  setConnected: (connected) => set({ connected }),
  setUserOnline: (userId) =>
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    })),
  setUserOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),
  incrementUnread: (chatId) =>
    set((state) => {
      const next = new Map(state.unreadCounts);
      next.set(chatId, (next.get(chatId) ?? 0) + 1);
      return { unreadCounts: next };
    }),
  clearUnread: (chatId) =>
    set((state) => {
      const next = new Map(state.unreadCounts);
      next.delete(chatId);
      return { unreadCounts: next };
    }),
}));
