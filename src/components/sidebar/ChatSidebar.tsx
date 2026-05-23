'use client';

import {
  Search,
  MoreHorizontal,
  Plus,
  SlidersHorizontal,
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

const tabs = ['Chats', 'Channels', 'Direct', 'Groups'];
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

  // ── Search state ──────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Friend request modal state ────────────────────────────
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');
  const [requestError, setRequestError] = useState('');

  // Fetch chats + groups in parallel on mount, merge into one list
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

      // Build a map of chatId → group name for quick lookup
      const groupNameMap = new Map<string, string>(
        groups.map((g) => [g.chat, g.name]),
      );

      // Annotate group chats with their name
      const annotated = dmChats.map((c) =>
        groupNameMap.has(c._id) ? { ...c, name: groupNameMap.get(c._id) } : c,
      );

      // Also add any group chats not already in the DM list
      const existingIds = new Set(dmChats.map((c: { _id: string }) => c._id));
      // (GET /chats should already include group chats, but guard just in case)

      setChats(
        annotated.filter((c: { _id: string }) => existingIds.has(c._id)),
      );
    });
  }, [setChats]);

  // Debounced search
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
    if (!chat || activeChat?._id === chatId) return; // already active — no-op
    setActiveChat(chat);
    // ChatWindow owns the message fetch — no fetch here
  };

  // ── Friend request handlers ───────────────────────────────
  const openRequestModal = (u: User) => {
    setPendingUser(u);
    setRequestStatus('idle');
    setRequestError('');
  };

  const closeRequestModal = () => {
    if (requestStatus === 'sending') return; // block close while in-flight
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
          ?.message ?? 'Failed to send request. Please try again.';
      setRequestError(msg);
      setRequestStatus('error');
    }
  };

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const isSearching = query.trim().length > 0;

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-300 overflow-hidden shrink-0',
        fullWidth ? 'w-full' : sidebarOpen ? 'w-[300px]' : 'w-0',
      )}
    >
      <div
        className={cn(
          'flex flex-col h-full',
          fullWidth ? 'w-full' : 'w-[300px]',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-base font-semibold text-gray-900">Chats</h1>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGroupModalOpen(true)}
              title="New group"
              className="w-7 h-7 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-3 pb-2">
          <div
            className={cn(
              'flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-1.5 transition-colors',
              isSearching ? 'border-blue-300 bg-white' : 'border-gray-200',
            )}
          >
            {searching ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            )}
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search chats and contacts (ctrl + k)"
              className="bg-transparent text-xs text-gray-600 placeholder:text-gray-400 outline-none w-full"
            />
            {isSearching && (
              <button
                onClick={() => {
                  setQuery('');
                  setSearchResults([]);
                  setSearching(false);
                }}
                className="text-gray-400 hover:text-gray-600 shrink-0"
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
              <p className="text-xs text-gray-400 text-center mt-8 px-4">
                No users found
              </p>
            )}
            {searchResults.map((u) => {
              const initials = u.username.slice(0, 2).toUpperCase();
              const isSelf = u._id === user?._id;
              return (
                <div
                  key={u._id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.username}
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
                      {u.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>

                  {/* Add friend button */}
                  {!isSelf && (
                    <button
                      onClick={() => openRequestModal(u)}
                      title="Send friend request"
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 px-3 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    tab === 'Chats'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-500 hover:bg-gray-100',
                  )}
                >
                  {tab}
                </button>
              ))}
              <button className="ml-auto text-gray-400 hover:text-gray-600">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Invite banner */}
            <div className="mx-3 mb-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex -space-x-2">
                  {[
                    'from-purple-400 to-purple-600',
                    'from-blue-400 to-blue-600',
                    'from-teal-400 to-teal-600',
                  ].map((g, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-6 h-6 rounded-full bg-linear-to-br border-2 border-white flex items-center justify-center text-white text-[10px] font-semibold',
                        g,
                      )}
                    >
                      {['A', 'B', 'C'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-800">
                  Your friends are waiting for you
                </p>
              </div>
              <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">
                Find and message people you know
              </p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors">
                Explore contacts
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 && (
                <p className="text-xs text-gray-400 text-center mt-8 px-4">
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
                const lastMsg =
                  chat.lastMessage?.senderContent ??
                  chat.lastMessage?.content ??
                  '';
                const lastTime = chat.updatedAt
                  ? new Date(chat.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';

                return (
                  <button
                    key={chat._id}
                    onClick={() => handleSelectChat(chat._id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      isActive ? 'bg-blue-50' : 'hover:bg-gray-50',
                    )}
                  >
                    {partner?.avatar ? (
                      <img
                        src={partner.avatar}
                        alt={displayName}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {displayName}
                        </span>
                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                          {lastTime}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5 italic">
                        {lastMsg}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Friend request confirmation modal ─────────────── */}
      <Dialog
        open={!!pendingUser}
        onOpenChange={(open: boolean) => {
          if (!open) closeRequestModal();
        }}
      >
        <DialogContent
          showCloseButton={requestStatus !== 'sending'}
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Send Friend Request</DialogTitle>
            <DialogDescription>
              {requestStatus === 'sent'
                ? `Friend request sent to ${pendingUser?.username}!`
                : `Send a friend request to ${pendingUser?.username}?`}
            </DialogDescription>
          </DialogHeader>

          {/* User preview */}
          {pendingUser && requestStatus !== 'sent' && (
            <div className="flex items-center gap-3 py-1">
              {pendingUser.avatar ? (
                <img
                  src={pendingUser.avatar}
                  alt={pendingUser.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                  {pendingUser.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {pendingUser.username}
                </p>
                <p className="text-xs text-gray-400">{pendingUser.email}</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {requestStatus === 'error' && (
            <p className="text-xs text-red-500 -mt-1">{requestError}</p>
          )}

          <DialogFooter>
            {requestStatus === 'sent' ? (
              <Button
                onClick={closeRequestModal}
                className="bg-green-500 hover:bg-green-600 text-white gap-1.5"
              >
                <Check className="w-4 h-4" /> Done
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={closeRequestModal}
                  disabled={requestStatus === 'sending'}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendFriendRequest}
                  disabled={requestStatus === 'sending'}
                  className="bg-blue-500 hover:bg-blue-600 text-white gap-1.5"
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

      {/* ── Create Group modal ────────────────────────────── */}
      <CreateGroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
      />
    </div>
  );
}
