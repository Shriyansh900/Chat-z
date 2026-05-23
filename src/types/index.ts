export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Message {
  _id: string;
  sender: Pick<User, '_id' | 'username' | 'avatar'>;
  chat: string | { _id: string }; // string ID or populated object
  content: string;
  file?: string;
  createdAt: string;
}

export interface Chat {
  _id: string;
  name?: string; // set for group chats
  users: User[];
  isGroup: boolean;
  lastMessage?: Message | null;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  admin: Pick<User, '_id' | 'username' | 'avatar'>;
  members: Pick<User, '_id' | 'username' | 'avatar'>[];
  chat: string; // chat ID
  createdAt: string;
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
