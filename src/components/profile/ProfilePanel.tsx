'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X,
  Loader2,
  ShieldCheck,
  Calendar,
  Mail,
  User as UserIcon,
  FileText,
  Pencil,
  Camera,
  Check,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { User } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { disconnectSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { useRouter } from 'next/navigation';

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'view' | 'edit';

export default function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  const { setUser, logout } = useAuthStore();
  const { clearActiveChat } = useChatStore();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [mode, setMode] = useState<Mode>('view');
  const [loggingOut, setLoggingOut] = useState(false);

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch {
      /* proceed */
    } finally {
      disconnectSocket();
      logout();
      clearActiveChat();
      router.replace('/login');
    }
  };

  useEffect(() => {
    if (!open) return;
    setMode('view');
    setLoading(true);
    setFetchError('');
    api
      .get<User>('/users/me')
      .then((res) => setProfile(res.data))
      .catch(() => setFetchError('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [open]);

  const enterEdit = () => {
    if (!profile) return;
    setUsername(profile.username);
    setBio(profile.bio ?? '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setSaveError('');
    setSaveSuccess(false);
    setMode('edit');
  };

  const cancelEdit = () => {
    setMode('view');
    setSaveError('');
    setSaveSuccess(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setSaveError('Username cannot be empty.');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    const form = new FormData();
    form.append('username', username.trim());
    form.append('bio', bio.trim());
    if (avatarFile) form.append('avatar', avatarFile);
    try {
      const res = await api.put<User>('/users/me', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = res.data;
      setProfile(updated);
      setUser(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setMode('view');
        setSaveSuccess(false);
      }, 1000);
    } catch (err: unknown) {
      setSaveError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save.',
      );
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '??';
  const displayAvatar = avatarPreview ?? profile?.avatar ?? null;
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            if (mode === 'edit') return;
            onClose();
          }}
        />
      )}

      <div
        className={cn(
          'fixed top-0 h-full z-40 flex flex-col transition-transform duration-300',
          'left-0 w-full sm:left-[52px] sm:w-[320px]',
          'bg-[#060d14] border-r border-[#6fd1d7]/10 shadow-2xl shadow-[#060d14]/80',
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#6fd1d7]/10 shrink-0">
          <h2 className="text-sm font-semibold text-white">
            {mode === 'edit' ? 'Edit Profile' : 'My Profile'}
          </h2>
          <div className="flex items-center gap-1">
            {mode === 'view' && profile && (
              <button
                onClick={enterEdit}
                title="Edit profile"
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-[#5df8d8] rounded-lg hover:bg-[#5df8d8]/10 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={mode === 'edit' ? cancelEdit : onClose}
              className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-300 rounded-lg hover:bg-[#6fd1d7]/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center mt-16">
              <Loader2 className="w-5 h-5 text-[#6fd1d7] animate-spin" />
            </div>
          )}
          {!loading && fetchError && (
            <p className="text-xs text-red-400 text-center mt-10 px-4">
              {fetchError}
            </p>
          )}

          {/* VIEW MODE */}
          {!loading && profile && mode === 'view' && (
            <>
              {/* Hero */}
              <div
                className="flex flex-col items-center px-6 pt-8 pb-6 border-b border-[#6fd1d7]/10"
                style={{
                  background:
                    'radial-gradient(at 50% 0%, rgba(9,60,93,0.6) 0px, transparent 70%), #060d14',
                }}
              >
                <div className="relative mb-4">
                  {profile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar}
                      alt={profile.username}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-[#6fd1d7]/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-2xl font-bold ring-2 ring-[#6fd1d7]/30 shadow-lg">
                      {initials}
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[#5df8d8] border-2 border-[#060d14] rounded-full" />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-lg font-bold text-white">
                    {profile.username}
                  </h3>
                  {profile.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-[#5df8d8] shrink-0" />
                  )}
                </div>
                {profile.bio ? (
                  <p className="text-sm text-slate-400 text-center leading-relaxed max-w-[220px]">
                    {profile.bio}
                  </p>
                ) : (
                  <button
                    onClick={enterEdit}
                    className="text-xs text-[#6fd1d7] hover:text-[#5df8d8] transition-colors mt-0.5"
                  >
                    + Add a bio
                  </button>
                )}
              </div>

              {/* Info rows */}
              <div className="px-4 py-4 flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1 px-1">
                  Account Info
                </p>
                <InfoRow
                  icon={<UserIcon className="w-4 h-4" />}
                  label="Username"
                  value={profile.username}
                />
                <InfoRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={profile.email}
                />
                {profile.bio && (
                  <InfoRow
                    icon={<FileText className="w-4 h-4" />}
                    label="Bio"
                    value={profile.bio}
                  />
                )}
                {joinedDate && (
                  <InfoRow
                    icon={<Calendar className="w-4 h-4" />}
                    label="Joined"
                    value={joinedDate}
                  />
                )}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#093c5d]/20 border border-[#6fd1d7]/10">
                  <span className="text-slate-500 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-500">Verification</p>
                    <p className="text-sm font-medium">
                      {profile.isVerified ? (
                        <span className="text-[#5df8d8]">Verified</span>
                      ) : (
                        <span className="text-amber-400">Not verified</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-4">
                <p className="text-[11px] text-slate-700 break-all font-mono">
                  ID: {profile._id}
                </p>
              </div>

              {/* Sign out */}
              <div className="px-4 pb-6 border-t border-[#6fd1d7]/10 pt-3">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 disabled:opacity-50 transition-colors"
                >
                  {loggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </>
          )}

          {/* EDIT MODE */}
          {!loading && profile && mode === 'edit' && (
            <div className="px-4 py-6 flex flex-col gap-5">
              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-[#6fd1d7]/30 shadow-lg group focus:outline-none"
                >
                  {displayAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayAvatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#6fd1d7] to-[#3b7597] flex items-center justify-center text-white text-2xl font-bold">
                      {initials}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-[11px] text-slate-500">
                  Click avatar to change photo
                </p>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" /> Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSaveError('');
                  }}
                  maxLength={30}
                  placeholder="Your username"
                  className="w-full glass bg-[#093c5d]/20 text-white placeholder-slate-600 px-3 py-2.5 rounded-xl border border-[#6fd1d7]/15 focus:border-[#5df8d8]/50 focus:outline-none transition-all text-sm"
                />
                <p className="text-[10px] text-slate-600 text-right">
                  {username.length}/30
                </p>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Bio{' '}
                  <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder="Tell people a little about yourself…"
                  className="w-full glass bg-[#093c5d]/20 text-white placeholder-slate-600 px-3 py-2.5 rounded-xl border border-[#6fd1d7]/15 focus:border-[#5df8d8]/50 focus:outline-none transition-all resize-none text-sm"
                />
                <p className="text-[10px] text-slate-600 text-right">
                  {bio.length}/160
                </p>
              </div>

              {/* Email — read-only */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> Email{' '}
                  <span className="text-slate-600 font-normal">
                    (cannot change)
                  </span>
                </label>
                <div className="w-full glass bg-[#093c5d]/10 border border-[#6fd1d7]/10 rounded-xl px-3 py-2.5 text-sm text-slate-500 select-none">
                  {profile.email}
                </div>
              </div>

              {saveError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-400/10 border border-red-400/20">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{saveError}</p>
                </div>
              )}
              {saveSuccess && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#5df8d8]/10 border border-[#5df8d8]/20">
                  <Check className="w-4 h-4 text-[#5df8d8] shrink-0" />
                  <p className="text-xs text-[#5df8d8]">Profile updated!</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-[#6fd1d7]/15 hover:bg-[#6fd1d7]/5 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !username.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#060d14] bg-gradient-to-r from-[#5df8d8] to-[#6fd1d7] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#093c5d]/20 border border-[#6fd1d7]/10">
      <span className="text-slate-500 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="text-sm font-medium text-white truncate">{value}</p>
      </div>
    </div>
  );
}
