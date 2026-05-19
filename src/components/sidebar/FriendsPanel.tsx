'use client';

import { useEffect, useState } from 'react';
import {
  X,
  RefreshCw,
  Loader2,
  MessageCircle,
  UserCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { User } from '@/types';
import { useChatStore } from '@/store/chatStore';

interface FriendsPanelProps {
  open: boolean;
  onClose: () => void;
  /** When true, renders inline (fills parent) instead of as a fixed overlay */
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

  const { chats, setChats, setActiveChat } = useChatStore();

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
      // silently fail
    } finally {
      setDmLoading(null);
    }
  };

  // Inline mode — fills parent, no overlay
  if (inline) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Friends</h2>
          <button
            onClick={fetchFriends}
            title="Refresh"
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw
              className={cn('w-3.5 h-3.5', loading && 'animate-spin')}
            />
          </button>
        </div>
        {!loading && friends.length > 0 && (
          <p className="px-4 py-2 text-[11px] text-gray-400 border-b border-gray-50">
            {friends.length} friend{friends.length !== 1 ? 's' : ''}
          </p>
        )}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex justify-center mt-12">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          )}
          {!loading && friends.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <UserCircle2 className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                No friends yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Search for users and send friend requests to get started
              </p>
            </div>
          )}
          {!loading &&
            friends.map((friend) => {
              const initials = friend.username.slice(0, 2).toUpperCase();
              const isLoadingDM = dmLoading === friend._id;
              return (
                <div
                  key={friend._id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt={friend.username}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {friend.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {friend.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenDM(friend)}
                    disabled={isLoadingDM}
                    title="Send message"
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {isLoadingDM ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageCircle className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-30" onClick={onClose} />}

      {/* Panel — full screen on mobile, side panel on desktop */}
      <div
        className={cn(
          'fixed top-0 h-full bg-white shadow-lg z-40 flex flex-col transition-transform duration-300',
          'left-0 w-full sm:left-[52px] sm:w-[300px] sm:border-r border-gray-100',
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Friends</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={fetchFriends}
              title="Refresh"
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw
                className={cn('w-3.5 h-3.5', loading && 'animate-spin')}
              />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Count */}
        {!loading && friends.length > 0 && (
          <p className="px-4 py-2 text-[11px] text-gray-400 border-b border-gray-50">
            {friends.length} friend{friends.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center mt-12">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          )}

          {!loading && friends.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <UserCircle2 className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                No friends yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Search for users and send friend requests to get started
              </p>
            </div>
          )}

          {!loading &&
            friends.map((friend) => {
              const initials = friend.username.slice(0, 2).toUpperCase();
              const isLoadingDM = dmLoading === friend._id;

              return (
                <div
                  key={friend._id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt={friend.username}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {friend.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {friend.email}
                    </p>
                  </div>

                  {/* Message button */}
                  <button
                    onClick={() => handleOpenDM(friend)}
                    disabled={isLoadingDM}
                    title="Send message"
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {isLoadingDM ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageCircle className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
