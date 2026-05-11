export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface Message {
  _id: string;
  sender: User;
  chat: string;
  content: string;
  file?: string;
  createdAt: string;
}

export interface Chat {
  _id: string;
  users: User[];
  isGroup: boolean;
  lastMessage?: Message;
  updatedAt: string;
}

export interface FriendRequest {
  _id: string;
  sender: User;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected';
}

// ── Auth ─────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
