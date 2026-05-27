'use client';

import { useEffect, useState } from 'react';
import {
  X,
  RefreshCw,
  Loader2,
  MessageCircle,
  UserCircle2,
  UserMinus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { User } from '@/types';
import { useChatStore } from '@/store/chatStore';
import { useSocketStore } from '@/store/socketStore';

interface FriendsPanelProps {
  open: boolean;
  onClose: () => void;
  inline?: boolean;
}

export default function FriendsPanel({
  open,
  onClose,
  inline = false,
}: FriendsPanelProps) {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dmLoading, setDmLoading] = useState<string | null>(null);
  const [unfriendingId, setUnfriendingId] = useState<string | null>(null);
  const { chats, setChats, setActiveChat } = useChatStore();
  const { onlineUsers } = useSocketStore();

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await api.get('/friends');
      const data: User[] = Array.isArray(res.data)
        ? res.data
        : res.data
          ? [res.data]
          : [];
      setFriends(data);
    } catch {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchFriends();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenDM = async (friend: User) => {
    setDmLoading(friend._id);
    try {
      const res = await api.post('/chats', { userId: friend._id });
      const chat = res.data;
      setChats([chat, ...chats.filter((c) => c._id !== chat._id)]);
      setActiveChat(chat);
      onClose();
    } catch {
      /* silent */
    } finally {
      setDmLoading(null);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    setUnfriendingId(friendId);
    try {
      await api.delete(`/friends/${friendId}`);
      setFriends((prev) => prev.filter((f) => f._id !== friendId));
    } catch {
      /* silent */
    } finally {
      setUnfriendingId(null);
    }
  };

  const friendList = (
    <div className="flex-1 overflow-y-auto">
      {loading && (
        <div className="flex justify-center mt-12">
          <Loader2 className="w-5 h-5 text-[#6fd1d7] animate-spin" />
        </div>
      )}
      {!loading && friends.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-16 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#093c5d]/40 border border-[#6fd1d7]/10 flex items-center justify-center mb-3">
            <UserCircle2 className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-400">No friends yet</p>
          <p className="text-xs text-slate-600 mt-1">
            Search for users and send friend requests to get started
          </p>
        </div>
      )}
      {!loading &&
        friends.map((friend) => {
          const initials = friend.username.slice(0, 2).toUpperCase();
          const isLoadingDM = dmLoading === friend._id;
          const isOnline = onlineUsers.has(friend._id);
          return (
            <div
              key={friend._id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#6fd1d7]/5 transition-colors"
            >
              <div className="relative shrink-0">
                {friend.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className="w-9 h-9 rounded-full object-cover border border-[#6fd1d7]/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-xs font-semibold">
                    {initials}
                  </div>
                )}
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5df8d8] border-2 border-[#060d14] rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {friend.username}
                </p>
                <p
                  className={cn(
                    'text-xs truncate',
                    isOnline ? 'text-[#5df8d8]' : 'text-slate-500',
                  )}
                >
                  {isOnline ? 'Online' : friend.email}
                </p>
              </div>
              <button
                onClick={() => handleOpenDM(friend)}
                disabled={isLoadingDM}
                title="Send message"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#5df8d8]/10 text-[#5df8d8] hover:bg-[#5df8d8]/20 disabled:opacity-50 transition-colors shrink-0"
              >
                {isLoadingDM ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MessageCircle className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => handleUnfriend(friend._id)}
                disabled={unfriendingId === friend._id}
                title="Unfriend"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-red-400/10 text-red-400 hover:bg-red-400/20 disabled:opacity-50 transition-colors shrink-0"
              >
                {unfriendingId === friend._id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserMinus className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
    </div>
  );

  const header = (
    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#6fd1d7]/10">
      <h2 className="text-sm font-semibold text-white">Friends</h2>
      <div className="flex items-center gap-1">
        <button
          onClick={fetchFriends}
          title="Refresh"
          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-300 rounded-lg hover:bg-[#6fd1d7]/10 transition-colors"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </button>
        {!inline && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-300 rounded-lg hover:bg-[#6fd1d7]/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="flex flex-col h-full bg-[#060d14]">
        {header}
        {!loading && friends.length > 0 && (
          <p className="px-4 py-2 text-[11px] text-slate-600 border-b border-[#6fd1d7]/10">
            {friends.length} friend{friends.length !== 1 ? 's' : ''}
          </p>
        )}
        {friendList}
      </div>
    );
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-30" onClick={onClose} />}
      <div
        className={cn(
          'fixed top-0 h-full z-40 flex flex-col transition-transform duration-300',
          'left-0 w-full sm:left-[52px] sm:w-[300px]',
          'bg-[#060d14] border-r border-[#6fd1d7]/10 shadow-2xl shadow-[#060d14]/80',
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        )}
      >
        {header}
        {!loading && friends.length > 0 && (
          <p className="px-4 py-2 text-[11px] text-slate-600 border-b border-[#6fd1d7]/10">
            {friends.length} friend{friends.length !== 1 ? 's' : ''}
          </p>
        )}
        {friendList}
      </div>
    </>
  );
}
