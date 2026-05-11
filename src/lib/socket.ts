import { io, Socket } from 'socket.io-client';
import { useSocketStore } from '@/store/socketStore';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (userId: string) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('setup', userId);
    s.on('connected', () => useSocketStore.getState().setConnected(true));
  }
};

export const disconnectSocket = () => {
  socket?.disconnect();
  useSocketStore.getState().setConnected(false);
  socket = null;
};
