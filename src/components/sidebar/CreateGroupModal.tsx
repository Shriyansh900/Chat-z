'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Check } from 'lucide-react';
import api from '@/lib/axios';
import { User, Chat } from '@/types';
import { useChatStore } from '@/store/chatStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({
  open,
  onClose,
}: CreateGroupModalProps) {
  const { chats, setChats, setActiveChat } = useChatStore();
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setGroupName('');
    setSelectedIds(new Set());
    setError('');
    setLoadingFriends(true);
    api
      .get('/friends')
      .then((res) => {
        const data = res.data;
        setFriends(Array.isArray(data) ? data : data ? [data] : []);
      })
      .catch(() => setFriends([]))
      .finally(() => setLoadingFriends(false));
  }, [open]);

  const toggleMember = (id: string) =>
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('Group name is required.');
      return;
    }
    if (selectedIds.size === 0) {
      setError('Select at least one member.');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/groups', {
        name: groupName.trim(),
        members: Array.from(selectedIds),
      });
      const chatId: string = res.data.chat;
      const chatRes = await api.get('/chats');
      const allChats: Chat[] = Array.isArray(chatRes.data)
        ? chatRes.data
        : chatRes.data
          ? [chatRes.data]
          : [];
      setChats(allChats);
      const newChat = allChats.find((c) => c._id === chatId);
      if (newChat) setActiveChat(newChat);
      onClose();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to create group.',
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o: boolean) => {
        if (!o && !creating) onClose();
      }}
    >
      <DialogContent
        showCloseButton={!creating}
        className="max-w-sm bg-[#0a1929] border border-[#6fd1d7]/20 text-white"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Users className="w-4 h-4 text-[#5df8d8]" /> New Group
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Give your group a name and pick members from your friends.
          </DialogDescription>
        </DialogHeader>

        {/* Group name */}
        <input
          type="text"
          value={groupName}
          onChange={(e) => {
            setGroupName(e.target.value);
            setError('');
          }}
          placeholder="Group name"
          maxLength={50}
          className="w-full glass bg-[#093c5d]/20 text-white placeholder-slate-600 px-3 py-2.5 rounded-xl border border-[#6fd1d7]/15 focus:border-[#5df8d8]/50 focus:outline-none transition-all text-sm"
        />

        {/* Member picker */}
        <div className="max-h-48 overflow-y-auto -mx-1 px-1">
          {loadingFriends && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 text-[#6fd1d7] animate-spin" />
            </div>
          )}
          {!loadingFriends && friends.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">
              No friends to add. Add friends first.
            </p>
          )}
          {!loadingFriends &&
            friends.map((f) => {
              const selected = selectedIds.has(f._id);
              const initials = f.username.slice(0, 2).toUpperCase();
              return (
                <button
                  key={f._id}
                  type="button"
                  onClick={() => toggleMember(f._id)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors text-left ${selected ? 'bg-[#5df8d8]/10' : 'hover:bg-[#6fd1d7]/5'}`}
                >
                  {f.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.avatar}
                      alt={f.username}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#6fd1d7]/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {f.username}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{f.email}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-[#5df8d8] border-[#5df8d8]' : 'border-slate-600'}`}
                  >
                    {selected && <Check className="w-3 h-3 text-[#060d14]" />}
                  </div>
                </button>
              );
            })}
        </div>

        {selectedIds.size > 0 && (
          <p className="text-xs text-[#5df8d8] -mt-1">
            {selectedIds.size} member{selectedIds.size !== 1 ? 's' : ''}{' '}
            selected
          </p>
        )}
        {error && <p className="text-xs text-red-400 -mt-1">{error}</p>}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={creating}
            className="border-[#6fd1d7]/20 text-slate-300 hover:bg-[#6fd1d7]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !groupName.trim() || selectedIds.size === 0}
            className="bg-gradient-to-r from-[#5df8d8] to-[#6fd1d7] text-[#060d14] hover:opacity-90 gap-1.5"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Users className="w-4 h-4" /> Create Group
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
