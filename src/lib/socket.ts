import { io, Socket } from 'socket.io-client';
import { useSocketStore } from '@/store/socketStore';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      autoConnect: false,
      // Allow polling fallback — required for Render and other proxied hosts
      // that don't support direct WebSocket upgrades on free tier
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const connectSocket = (userId: string) => {
  const s = getSocket();

  // If already connected just re-emit setup (e.g. after token refresh)
  if (s.connected) {
    s.emit('setup', userId);
    return;
  }

  // Register connect handler — fires once per connection attempt
  s.once('connect', () => {
    s.emit('setup', userId);
  });

  // Backend emits 'connected' after processing 'setup'
  s.on('connected', () => {
    useSocketStore.getState().setConnected(true);
  });

  s.connect();
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.off('connected'); // clean up persistent listener
  socket.disconnect();
  useSocketStore.getState().setConnected(false);
  socket = null;
};
