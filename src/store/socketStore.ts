import { create } from 'zustand';

interface SocketStore {
  connected: boolean;
  /** Set of userIds currently online (friends only, per backend) */
  onlineUsers: Set<string>;
  setConnected: (connected: boolean) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  connected: false,
  onlineUsers: new Set(),
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
}));
