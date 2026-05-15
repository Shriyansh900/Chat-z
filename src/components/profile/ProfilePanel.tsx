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
  Key,
  Pencil,
  Camera,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { User } from '@/types';
import { useAuthStore } from '@/store/authStore';

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'view' | 'edit';

export default function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  const { setUser } = useAuthStore();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [mode, setMode] = useState<Mode>('view');

  // Edit form state
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile when panel opens
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

  // Seed edit fields when entering edit mode
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
      setUser(updated); // sync to authStore so avatar/name update everywhere
      setSaveSuccess(true);
      setTimeout(() => {
        setMode('view');
        setSaveSuccess(false);
      }, 1000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save. Please try again.';
      setSaveError(msg);
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
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            if (mode === 'edit') return; // block accidental close while editing
            onClose();
          }}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 h-full bg-white shadow-xl z-40 flex flex-col transition-transform duration-300',
          'left-0 w-full sm:left-[52px] sm:w-[320px] sm:border-r border-gray-100',
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Profile' : 'My Profile'}
          </h2>
          <div className="flex items-center gap-1">
            {mode === 'view' && profile && (
              <button
                onClick={enterEdit}
                title="Edit profile"
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={mode === 'edit' ? cancelEdit : onClose}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center mt-16">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          )}

          {/* Fetch error */}
          {!loading && fetchError && (
            <p className="text-xs text-red-400 text-center mt-10 px-4">
              {fetchError}
            </p>
          )}

          {/* ── VIEW MODE ── */}
          {!loading && profile && mode === 'view' && (
            <>
              {/* Hero */}
              <div className="flex flex-col items-center px-6 pt-8 pb-6 bg-linear-to-b from-blue-50 to-white border-b border-gray-100">
                <div className="relative mb-4">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.username}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-md">
                      {initials}
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {profile.username}
                  </h3>
                  {profile.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                </div>

                {profile.bio ? (
                  <p className="text-sm text-gray-500 text-center leading-relaxed max-w-[220px]">
                    {profile.bio}
                  </p>
                ) : (
                  <button
                    onClick={enterEdit}
                    className="text-xs text-blue-400 hover:text-blue-500 transition-colors mt-0.5"
                  >
                    + Add a bio
                  </button>
                )}
              </div>

              {/* Info rows */}
              <div className="px-4 py-4 flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 px-1">
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

                {/* Verification */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50">
                  <span className="text-gray-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400">Verification</p>
                    <p className="text-sm font-medium">
                      {profile.isVerified ? (
                        <span className="text-green-600">Verified</span>
                      ) : (
                        <span className="text-amber-500">Not verified</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* E2E key */}
                {profile.publicKey && (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50">
                    <span className="text-gray-400 shrink-0">
                      <Key className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-400">Encryption</p>
                      <p className="text-sm font-medium text-green-600">
                        E2E key registered
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 pb-6">
                <p className="text-[10px] text-gray-300 break-all font-mono">
                  ID: {profile._id}
                </p>
              </div>
            </>
          )}

          {/* ── EDIT MODE ── */}
          {!loading && profile && mode === 'edit' && (
            <div className="px-4 py-6 flex flex-col gap-5">
              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-md group focus:outline-none"
                  >
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                        {initials}
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                </div>
                <p className="text-[11px] text-gray-400">
                  Click avatar to change photo
                </p>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                  Username
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
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-gray-300"
                />
                <p className="text-[10px] text-gray-300 text-right">
                  {username.length}/30
                </p>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  Bio
                  <span className="text-gray-300 font-normal">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder="Tell people a little about yourself…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none placeholder:text-gray-300"
                />
                <p className="text-[10px] text-gray-300 text-right">
                  {bio.length}/160
                </p>
              </div>

              {/* Email — read-only */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  Email
                  <span className="text-gray-300 font-normal">
                    (cannot change)
                  </span>
                </label>
                <div className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-400 bg-gray-50 select-none">
                  {profile.email}
                </div>
              </div>

              {/* Error / success feedback */}
              {saveError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-500">{saveError}</p>
                </div>
              )}

              {saveSuccess && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-100">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-xs text-green-600">Profile updated!</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !username.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
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

// ── Info row helper ───────────────────────────────────────────
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
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}
