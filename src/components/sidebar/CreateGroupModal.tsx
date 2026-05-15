'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, X, Check } from 'lucide-react';
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

  // Fetch friends when modal opens
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

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

      // The API returns the group; fetch the associated chat and open it
      const chatId: string = res.data.chat;
      const chatRes = await api.get('/chats');
      const allChats: Chat[] = Array.isArray(chatRes.data)
        ? chatRes.data
        : chatRes.data
          ? [chatRes.data]
          : [];

      setChats(allChats);
      const newChat = allChats.find((c) => c._id === chatId);
      if (newChat) {
        setActiveChat(newChat);
      }
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to create group. Please try again.';
      setError(msg);
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
      <DialogContent showCloseButton={!creating} className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> New Group
          </DialogTitle>
          <DialogDescription>
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
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
        />

        {/* Member picker */}
        <div className="max-h-48 overflow-y-auto -mx-1 px-1">
          {loadingFriends && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            </div>
          )}
          {!loadingFriends && friends.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">
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
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left ${
                    selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {f.avatar ? (
                    <img
                      src={f.avatar}
                      alt={f.username}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {f.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{f.email}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selected
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Selected count */}
        {selectedIds.size > 0 && (
          <p className="text-xs text-blue-500 -mt-1">
            {selectedIds.size} member{selectedIds.size !== 1 ? 's' : ''}{' '}
            selected
          </p>
        )}

        {/* Error */}
        {error && <p className="text-xs text-red-500 -mt-1">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !groupName.trim() || selectedIds.size === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white gap-1.5"
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
