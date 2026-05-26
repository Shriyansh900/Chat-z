'use client';

import {
  Search,
  MoreHorizontal,
  Plus,
  X,
  Loader2,
  UserPlus,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useRef, useState } from 'react';
import api from '@/lib/axios';
import { User, Group } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CreateGroupModal from './CreateGroupModal';

const DEBOUNCE_MS = 400;
type RequestStatus = 'idle' | 'sending' | 'sent' | 'error';

export default function ChatSidebar({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) {
  const { sidebarOpen, chats, setChats, setActiveChat, activeChat } =
    useChatStore();
  const { user } = useAuthStore();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');
  const [requestError, setRequestError] = useState('');
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/chats').catch(() => ({ data: [] })),
      api.get('/groups').catch(() => ({ data: [] })),
    ]).then(([chatsRes, groupsRes]) => {
      const dmChats = Array.isArray(chatsRes.data)
        ? chatsRes.data
        : chatsRes.data
          ? [chatsRes.data]
          : [];
      const groups: Group[] = Array.isArray(groupsRes.data)
        ? groupsRes.data
        : groupsRes.data
          ? [groupsRes.data]
          : [];
      const groupNameMap = new Map<string, string>(
        groups.map((g) => [g.chat, g.name]),
      );
      const annotated = dmChats.map((c) =>
        groupNameMap.has(c._id) ? { ...c, name: groupNameMap.get(c._id) } : c,
      );
      const existingIds = new Set(dmChats.map((c: { _id: string }) => c._id));
      setChats(
        annotated.filter((c: { _id: string }) => existingIds.has(c._id)),
      );
    });
  }, [setChats]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) return;
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(
          `/users/search?search=${encodeURIComponent(query.trim())}`,
        );
        const data = res.data;
        setSearchResults(Array.isArray(data) ? data : data ? [data] : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setSearching(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chats.find((c) => c._id === chatId);
    if (!chat || activeChat?._id === chatId) return;
    setActiveChat(chat);
  };

  const openRequestModal = (u: User) => {
    setPendingUser(u);
    setRequestStatus('idle');
    setRequestError('');
  };
  const closeRequestModal = () => {
    if (requestStatus === 'sending') return;
    setPendingUser(null);
    setRequestStatus('idle');
    setRequestError('');
  };

  const sendFriendRequest = async () => {
    if (!pendingUser) return;
    setRequestStatus('sending');
    setRequestError('');
    try {
      await api.post('/friends/request', { receiverId: pendingUser._id });
      setRequestStatus('sent');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to send request.';
      setRequestError(msg);
      setRequestStatus('error');
    }
  };

  const isSearching = query.trim().length > 0;

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-[#060d14] border-r border-[#6fd1d7]/10 transition-all duration-300 overflow-hidden shrink-0',
        fullWidth ? 'w-full' : sidebarOpen ? 'w-[280px]' : 'w-0',
      )}
    >
      <div
        className={cn(
          'flex flex-col h-full',
          fullWidth ? 'w-full' : 'w-[280px]',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h1 className="text-sm font-bold text-white tracking-wide">
            Messages
          </h1>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGroupModalOpen(true)}
              title="New group"
              className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-[#5df8d8] to-[#6fd1d7] text-[#060d14] rounded-full hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-3 pb-3">
          <div
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 transition-all border',
              isSearching
                ? 'bg-[#093c5d]/40 border-[#5df8d8]/40'
                : 'bg-[#093c5d]/20 border-[#6fd1d7]/10 hover:border-[#6fd1d7]/20',
            )}
          >
            {searching ? (
              <Loader2 className="w-3.5 h-3.5 text-[#5df8d8] shrink-0 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search messages..."
              className="bg-transparent text-xs text-slate-300 placeholder:text-slate-600 outline-none w-full"
            />
            {isSearching && (
              <button
                onClick={() => {
                  setQuery('');
                  setSearchResults([]);
                  setSearching(false);
                }}
                className="text-slate-500 hover:text-slate-300 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search results */}
        {isSearching ? (
          <div className="flex-1 overflow-y-auto">
            {!searching && searchResults.length === 0 && (
              <p className="text-xs text-slate-600 text-center mt-8 px-4">
                No users found
              </p>
            )}
            {searchResults.map((u) => {
              const initials = u.username.slice(0, 2).toUpperCase();
              const isSelf = u._id === user?._id;
              return (
                <div
                  key={u._id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#6fd1d7]/5 transition-colors"
                >
                  {u.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.avatar}
                      alt={u.username}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#6fd1d7]/20"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {u.username}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  {!isSelf && (
                    <button
                      onClick={() => openRequestModal(u)}
                      title="Send friend request"
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-[#5df8d8]/10 text-[#5df8d8] hover:bg-[#5df8d8]/20 transition-colors shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 && (
              <p className="text-xs text-slate-600 text-center mt-8 px-4">
                No chats yet
              </p>
            )}
            {chats.map((chat) => {
              const partner = chat.users.find((u) => u._id !== user?._id);
              const displayName = chat.isGroup
                ? (chat.name ?? 'Group')
                : (partner?.username ?? 'Unknown');
              const initials = displayName.slice(0, 2).toUpperCase();
              const isActive = activeChat?._id === chat._id;
              const lastMsg = chat.lastMessage?.content ?? '';
              const lastTime = chat.updatedAt
                ? new Date(chat.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <button
                  key={chat._id}
                  onClick={() => handleSelectChat(chat._id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150',
                    isActive
                      ? 'bg-[#6fd1d7]/10 border-l-2 border-[#5df8d8]'
                      : 'border-l-2 border-transparent hover:bg-[#6fd1d7]/5',
                  )}
                >
                  <div className="relative shrink-0">
                    {partner?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={partner.avatar}
                        alt={displayName}
                        className="w-9 h-9 rounded-full object-cover border border-[#6fd1d7]/20"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-xs font-semibold">
                        {initials}
                      </div>
                    )}
                    {/* Online dot */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5df8d8] border-2 border-[#060d14] rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'text-sm font-medium truncate',
                          isActive ? 'text-white' : 'text-slate-200',
                        )}
                      >
                        {displayName}
                      </span>
                      <span className="text-[10px] text-slate-600 shrink-0 ml-2">
                        {lastTime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {lastMsg}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Friend request modal */}
      <Dialog
        open={!!pendingUser}
        onOpenChange={(open: boolean) => {
          if (!open) closeRequestModal();
        }}
      >
        <DialogContent
          showCloseButton={requestStatus !== 'sending'}
          className="max-w-sm bg-[#0a1929] border border-[#6fd1d7]/20 text-white"
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              Send Friend Request
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {requestStatus === 'sent'
                ? `Friend request sent to ${pendingUser?.username}!`
                : `Send a friend request to ${pendingUser?.username}?`}
            </DialogDescription>
          </DialogHeader>

          {pendingUser && requestStatus !== 'sent' && (
            <div className="flex items-center gap-3 py-1">
              {pendingUser.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pendingUser.avatar}
                  alt={pendingUser.username}
                  className="w-10 h-10 rounded-full object-cover border border-[#6fd1d7]/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-sm font-semibold">
                  {pendingUser.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {pendingUser.username}
                </p>
                <p className="text-xs text-slate-500">{pendingUser.email}</p>
              </div>
            </div>
          )}

          {requestStatus === 'error' && (
            <p className="text-xs text-red-400 -mt-1">{requestError}</p>
          )}

          <DialogFooter>
            {requestStatus === 'sent' ? (
              <Button
                onClick={closeRequestModal}
                className="bg-[#5df8d8] hover:bg-[#4ae8c8] text-[#060d14] gap-1.5"
              >
                <Check className="w-4 h-4" /> Done
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={closeRequestModal}
                  disabled={requestStatus === 'sending'}
                  className="border-[#6fd1d7]/20 text-slate-300 hover:bg-[#6fd1d7]/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendFriendRequest}
                  disabled={requestStatus === 'sending'}
                  className="bg-gradient-to-r from-[#5df8d8] to-[#6fd1d7] text-[#060d14] hover:opacity-90 gap-1.5"
                >
                  {requestStatus === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Send Request
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateGroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
      />
    </div>
  );
}
