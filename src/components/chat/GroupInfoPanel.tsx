'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Loader2,
  Crown,
  Users,
  UserPlus,
  Check,
  LogOut,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { Group, User } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

interface GroupInfoPanelProps {
  groupChatId: string;
  open: boolean;
  onClose: () => void;
}

export default function GroupInfoPanel({
  groupChatId,
  open,
  onClose,
}: GroupInfoPanelProps) {
  const { user: currentUser } = useAuthStore();
  const { removeChat } = useChatStore();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add members state
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Leave group state
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState('');

  // Delete group state (admin only)
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Transfer admin state
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');

  const fetchGroup = (groupId: string) =>
    api.get(`/groups/${groupId}`).then((r) => setGroup(r.data));

  useEffect(() => {
    if (!open || !groupChatId) return;
    setLoading(true);
    setError('');
    setShowAddMembers(false);
    setSelectedIds(new Set());

    api
      .get('/groups')
      .then((res) => {
        const all: Group[] = Array.isArray(res.data)
          ? res.data
          : res.data
            ? [res.data]
            : [];
        const found = all.find((g) => g.chat === groupChatId);
        if (!found) throw new Error('not found');
        return api.get(`/groups/${found._id}`);
      })
      .then((res) => setGroup(res.data))
      .catch(() => setError('Could not load group info.'))
      .finally(() => setLoading(false));
  }, [open, groupChatId]);

  // Load friends when add-members section opens
  useEffect(() => {
    if (!showAddMembers) return;
    setLoadingFriends(true);
    setAddError('');
    api
      .get('/friends')
      .then((res) => {
        const all: User[] = Array.isArray(res.data)
          ? res.data
          : res.data
            ? [res.data]
            : [];
        // Filter out users already in the group
        const memberIds = new Set(group?.members.map((m) => m._id) ?? []);
        setFriends(all.filter((f) => !memberIds.has(f._id)));
      })
      .catch(() => setFriends([]))
      .finally(() => setLoadingFriends(false));
  }, [showAddMembers]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleAddMembers = async () => {
    if (!group || selectedIds.size === 0) return;
    setAdding(true);
    setAddError('');
    try {
      await api.put(`/groups/${group._id}/members`, {
        userIds: Array.from(selectedIds),
      });
      await fetchGroup(group._id);
      setShowAddMembers(false);
      setSelectedIds(new Set());
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to add members.';
      setAddError(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!group) return;
    setRemovingId(memberId);
    try {
      await api.delete(`/groups/${group._id}/members/${memberId}`);
      await fetchGroup(group._id);
    } catch {
      // silently fail — member list stays unchanged
    } finally {
      setRemovingId(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    setLeaving(true);
    setLeaveError('');
    try {
      await api.delete(`/groups/${group._id}/leave`);
      // Remove the group chat from the sidebar and close the panel
      removeChat(group.chat);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to leave group. Please try again.';
      setLeaveError(msg);
    } finally {
      setLeaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/groups/${group._id}`);
      removeChat(group.chat);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to delete group. Please try again.';
      setDeleteError(msg);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleTransferAdmin = async (userId: string) => {
    if (!group) return;
    setTransferring(true);
    setTransferError('');
    try {
      await api.put(`/groups/${group._id}/admin`, { userId });
      // Refresh group so the new admin badge renders correctly
      await fetchGroup(group._id);
      setTransferTargetId(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to transfer admin. Please try again.';
      setTransferError(msg);
      setTransferTargetId(null);
    } finally {
      setTransferring(false);
    }
  };

  const isAdmin = group?.admin._id === currentUser?._id;

  return (
    <>
      {open && <div className="fixed inset-0 z-30" onClick={onClose} />}

      {/* Panel — full screen on mobile, right side panel on desktop */}
      <div
        className={cn(
          'fixed top-0 h-full bg-white shadow-lg z-40 flex flex-col transition-transform duration-300',
          'right-0 w-full sm:w-[300px] sm:border-l border-gray-100',
          open ? 'translate-x-0' : 'translate-x-full pointer-events-none',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Group Info
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center mt-12">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          )}

          {!loading && error && (
            <p className="text-xs text-red-400 text-center mt-8 px-4">
              {error}
            </p>
          )}

          {!loading && group && (
            <>
              {/* Group avatar + name */}
              <div className="flex flex-col items-center px-4 py-6 border-b border-gray-50">
                {group.avatar ? (
                  <img
                    src={group.avatar}
                    alt={group.name}
                    className="w-16 h-16 rounded-full object-cover mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold mb-3">
                    {group.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <p className="text-base font-semibold text-gray-900">
                  {group.name}
                </p>
                {group.description && (
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    {group.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {group.members.length} member
                  {group.members.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Members list */}
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Members
                  </p>
                  {/* Add members button — admin only */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowAddMembers((v) => !v);
                        setAddError('');
                        setSelectedIds(new Set());
                      }}
                      className={cn(
                        'flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors',
                        showAddMembers
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-50 text-blue-500 hover:bg-blue-100',
                      )}
                    >
                      <UserPlus className="w-3 h-3" />
                      {showAddMembers ? 'Cancel' : 'Add'}
                    </button>
                  )}
                </div>

                {group.members.map((member) => {
                  const isAdminMember = member._id === group.admin._id;
                  const initials = member.username.slice(0, 2).toUpperCase();
                  const isRemoving = removingId === member._id;
                  const isTransferTarget = transferTargetId === member._id;
                  return (
                    <div key={member._id} className="flex flex-col py-2">
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.username}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.username}
                          </p>
                        </div>
                        {isAdminMember ? (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                            <Crown className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          isAdmin && (
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Transfer admin button */}
                              <button
                                onClick={() => {
                                  setTransferTargetId(
                                    isTransferTarget ? null : member._id,
                                  );
                                  setTransferError('');
                                }}
                                disabled={!!removingId || transferring}
                                title="Make admin"
                                className="w-6 h-6 flex items-center justify-center rounded-full text-amber-400 hover:bg-amber-50 hover:text-amber-500 disabled:opacity-40 transition-colors"
                              >
                                <Crown className="w-3.5 h-3.5" />
                              </button>
                              {/* Remove member button */}
                              <button
                                onClick={() => handleRemoveMember(member._id)}
                                disabled={!!removingId || transferring}
                                title="Remove member"
                                className="w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 transition-colors"
                              >
                                {isRemoving ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )
                        )}
                      </div>

                      {/* Inline transfer confirmation */}
                      {isAdmin && isTransferTarget && (
                        <div className="mt-2 ml-11 rounded-lg border border-amber-100 bg-amber-50 p-2.5">
                          <p className="text-[11px] text-amber-700 font-medium mb-1">
                            Make {member.username} the new admin?
                          </p>
                          <p className="text-[10px] text-amber-500 mb-2">
                            You will become a regular member.
                          </p>
                          {transferError && (
                            <p className="text-[10px] text-red-500 mb-2">
                              {transferError}
                            </p>
                          )}
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                setTransferTargetId(null);
                                setTransferError('');
                              }}
                              disabled={transferring}
                              className="flex-1 py-1 rounded text-[11px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleTransferAdmin(member._id)}
                              disabled={transferring}
                              className="flex-1 py-1 rounded text-[11px] font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                            >
                              {transferring ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Crown className="w-3 h-3" />
                              )}
                              {transferring ? 'Transferring…' : 'Confirm'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add members picker — admin only */}
              {isAdmin && showAddMembers && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Add from friends
                  </p>

                  {loadingFriends && (
                    <div className="flex justify-center py-3">
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    </div>
                  )}

                  {!loadingFriends && friends.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">
                      All friends are already in this group.
                    </p>
                  )}

                  {!loadingFriends &&
                    friends.map((f) => {
                      const selected = selectedIds.has(f._id);
                      const initials = f.username.slice(0, 2).toUpperCase();
                      return (
                        <button
                          key={f._id}
                          onClick={() => toggleSelect(f._id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left',
                            selected ? 'bg-blue-50' : 'hover:bg-gray-50',
                          )}
                        >
                          {f.avatar ? (
                            <img
                              src={f.avatar}
                              alt={f.username}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                              {initials}
                            </div>
                          )}
                          <p className="flex-1 text-sm font-medium text-gray-900 truncate">
                            {f.username}
                          </p>
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                              selected
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300',
                            )}
                          >
                            {selected && (
                              <Check className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                        </button>
                      );
                    })}

                  {addError && (
                    <p className="text-xs text-red-500 mt-2">{addError}</p>
                  )}

                  {friends.length > 0 && (
                    <button
                      onClick={handleAddMembers}
                      disabled={adding || selectedIds.size === 0}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                    >
                      {adding ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{' '}
                          Adding…
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" /> Add{' '}
                          {selectedIds.size > 0 ? `${selectedIds.size} ` : ''}
                          Member{selectedIds.size !== 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Created date */}
              <div className="px-4 pb-4">
                <p className="text-[11px] text-gray-400">
                  Created{' '}
                  {new Date(group.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Leave group — non-admin members only */}
              {!isAdmin && (
                <div className="px-4 pb-5 border-t border-gray-50 pt-3">
                  {leaveError && (
                    <p className="text-xs text-red-500 mb-2">{leaveError}</p>
                  )}
                  <button
                    onClick={handleLeaveGroup}
                    disabled={leaving}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    {leaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {leaving ? 'Leaving…' : 'Leave Group'}
                  </button>
                </div>
              )}

              {/* Delete group — admin only */}
              {isAdmin && (
                <div className="px-4 pb-5 border-t border-gray-50 pt-3">
                  {deleteError && (
                    <p className="text-xs text-red-500 mb-2">{deleteError}</p>
                  )}
                  {confirmDelete ? (
                    <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                      <p className="text-xs text-red-600 font-medium mb-1">
                        Delete &ldquo;{group.name}&rdquo;?
                      </p>
                      <p className="text-[11px] text-red-400 mb-3">
                        This will permanently delete the group and all its
                        messages for everyone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          disabled={deleting}
                          className="flex-1 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteGroup}
                          disabled={deleting}
                          className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                        >
                          {deleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          {deleting ? 'Deleting…' : 'Yes, delete'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Group
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
