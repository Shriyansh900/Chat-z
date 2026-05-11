import { create } from 'zustand';

interface SocketStore {
  connected: boolean;
  setConnected: (connected: boolean) => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
}));
