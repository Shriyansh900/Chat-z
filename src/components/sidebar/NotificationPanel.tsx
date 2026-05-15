'use client';

import { useEffect, useState } from 'react';
import { X, UserCheck, UserX, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { FriendRequest } from '@/types';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  onCountChange: (count: number) => void;
  /** Renders inline (fills parent) instead of a fixed overlay — used on mobile */
  inline?: boolean;
}

type ActionState = 'idle' | 'accepting' | 'rejecting' | 'done';

export default function NotificationPanel({
  open,
  onClose,
  onCountChange,
  inline = false,
}: NotificationPanelProps) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionState, setActionState] = useState<Record<string, ActionState>>(
    {},
  );

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/friends/requests');
      const data: FriendRequest[] = Array.isArray(res.data)
        ? res.data
        : res.data
          ? [res.data]
          : [];
      setRequests(data);
      onCountChange(data.filter((r) => r.status === 'pending').length);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchRequests();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = async (requestId: string) => {
    setActionState((s) => ({ ...s, [requestId]: 'accepting' }));
    try {
      await api.put(`/friends/request/${requestId}`, { action: 'accept' });
      setActionState((s) => ({ ...s, [requestId]: 'done' }));
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      onCountChange(
        requests.filter((r) => r._id !== requestId && r.status === 'pending')
          .length,
      );
    } catch {
      setActionState((s) => ({ ...s, [requestId]: 'idle' }));
    }
  };

  const handleReject = async (requestId: string) => {
    setActionState((s) => ({ ...s, [requestId]: 'rejecting' }));
    try {
      await api.put(`/friends/request/${requestId}`, { action: 'reject' });
      setActionState((s) => ({ ...s, [requestId]: 'done' }));
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      onCountChange(
        requests.filter((r) => r._id !== requestId && r.status === 'pending')
          .length,
      );
    } catch {
      setActionState((s) => ({ ...s, [requestId]: 'idle' }));
    }
  };

  // Shared content block
  const content = (
    <>
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Friend Requests</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchRequests}
            title="Refresh"
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw
              className={cn('w-3.5 h-3.5', loading && 'animate-spin')}
            />
          </button>
          {!inline && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center mt-12">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          </div>
        )}
        {!loading && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <UserCheck className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              No pending requests
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Friend requests will appear here
            </p>
          </div>
        )}
        {!loading &&
          requests.map((req) => {
            const state = actionState[req._id] ?? 'idle';
            const initials = req.sender.username.slice(0, 2).toUpperCase();
            const isBusy = state === 'accepting' || state === 'rejecting';
            return (
              <div
                key={req._id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {req.sender.avatar ? (
                  <img
                    src={req.sender.avatar}
                    alt={req.sender.username}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {req.sender.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {req.sender.email}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleAccept(req._id)}
                    disabled={isBusy}
                    title="Accept"
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors"
                  >
                    {state === 'accepting' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(req._id)}
                    disabled={isBusy}
                    title="Reject"
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    {state === 'rejecting' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserX className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );

  // Inline mode — fills parent container (mobile tab)
  if (inline) {
    return <div className="flex flex-col h-full bg-white">{content}</div>;
  }

  // Overlay mode — fixed side panel (desktop)
  return (
    <>
      {open && <div className="fixed inset-0 z-30" onClick={onClose} />}
      <div
        className={cn(
          'fixed top-0 h-full bg-white shadow-lg z-40 flex flex-col transition-transform duration-300',
          'left-0 w-full sm:left-[52px] sm:w-[300px] sm:border-r border-gray-100',
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        )}
      >
        {content}
      </div>
    </>
  );
}
