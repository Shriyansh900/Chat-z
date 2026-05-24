import { io, Socket } from 'socket.io-client';
import { useSocketStore } from '@/store/socketStore';
import { useAuthStore } from '@/store/authStore';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // Auth is passed via the `auth` option — server validates JWT on connection
    const token = useAuthStore.getState().accessToken ?? '';
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      autoConnect: false,
      // Allow polling fallback for proxied hosts (e.g. Render free tier)
      transports: ['websocket', 'polling'],
      auth: { token },
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (s.connected) return;

  // Server fires 'connected' after successful JWT auth
  s.on('connected', () => {
    useSocketStore.getState().setConnected(true);
  });

  s.connect();
};

/**
 * Call this when the access token is refreshed so the socket
 * reconnects with the new token.
 */
export const reconnectSocketWithToken = (token: string) => {
  if (!socket) return;
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.off('connected');
  socket.disconnect();
  useSocketStore.getState().setConnected(false);
  socket = null;
};
