import { io, Socket } from 'socket.io-client';
import { useSocketStore } from '@/store/socketStore';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
};

export const connectSocket = (userId: string) => {
  const s = getSocket();
  if (s.connected) return;

  // Emit setup only after the connection is established
  s.once('connect', () => {
    s.emit('setup', userId);
  });

  // Use once — prevents duplicate listeners if connectSocket is called again
  s.once('connected', () => {
    useSocketStore.getState().setConnected(true);
  });

  s.connect();
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  useSocketStore.getState().setConnected(false);
  socket = null;
};
