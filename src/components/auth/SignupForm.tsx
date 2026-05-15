'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '@/validations/auth.schema';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { BASE_URL } from '@/lib/axios';
import { connectSocket } from '@/lib/socket';
import { Eye, EyeOff, Camera } from 'lucide-react';

export default function SignupForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // OTP step
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
    e.target.value = '';
  };

  // Step 1 — send multipart signup
  const onSubmit = async (data: SignupInput) => {
    const form = new FormData();
    form.append('username', data.username);
    form.append('email', data.email);
    form.append('password', data.password);
    if (avatarFile) form.append('avatar', avatarFile);

    try {
      await axios.post(`${BASE_URL}/auth/signup`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPendingEmail(data.email);
      setStep('otp');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Signup failed. Please try again.')
        : 'An unexpected error occurred.';
      setError('root', { message });
    }
  };

  // Step 2 — verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length < 4) {
      setOtpError('Enter the OTP sent to your email.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/verify-signup`,
        { email: pendingEmail, otp: otp.trim() },
        { withCredentials: true },
      );
      setAuth(res.data.user, res.data.accessToken);
      connectSocket(res.data.user._id);
      router.push('/chat');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Invalid OTP. Please try again.')
        : 'An unexpected error occurred.';
      setOtpError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg('');
    setOtpError('');
    try {
      await axios.post(
        `${BASE_URL}/auth/resend-otp`,
        { email: pendingEmail, purpose: 'signup' },
        { withCredentials: true },
      );
      setResendMsg('A new OTP has been sent to your email.');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to resend OTP.')
        : 'An unexpected error occurred.';
      setOtpError(message);
    } finally {
      setResendLoading(false);
    }
  };

  // ── OTP step ──────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} noValidate>
        <h2 className="text-3xl font-bold mb-2">Verify your email</h2>
        <p className="text-sm text-gray-400 mb-6">
          We sent a 6-digit code to{' '}
          <span className="text-white font-medium">{pendingEmail}</span>. Enter
          it below to complete signup.
        </p>

        {otpError && <p className="text-red-400 text-sm mb-4">{otpError}</p>}
        {resendMsg && (
          <p className="text-green-400 text-sm mb-4">{resendMsg}</p>
        )}

        <div className="mb-6">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              setOtpError('');
              setResendMsg('');
            }}
            placeholder="123456"
            className="w-full bg-[#2a2640] p-3 rounded-lg text-center text-2xl tracking-[0.5em] font-mono"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={otpLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 transition p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {otpLoading ? 'Verifying…' : 'Verify & Continue'}
        </button>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setStep('form');
              setOtp('');
              setOtpError('');
              setResendMsg('');
            }}
            className="text-sm text-gray-400 hover:text-gray-200 transition"
          >
            ← Back to signup
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-purple-400 hover:text-purple-300 transition disabled:opacity-50"
          >
            {resendLoading ? 'Sending…' : 'Resend OTP'}
          </button>
        </div>
      </form>
    );
  }

  // ── Signup form step ──────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="text-3xl font-bold mb-2">Create an account</h2>

      <p className="text-sm text-gray-400 mb-6">
        Already have an account?{' '}
        <span
          onClick={() => router.push('/login')}
          className="underline cursor-pointer"
        >
          Log in
        </span>
      </p>

      {errors.root && (
        <p className="text-red-400 text-sm mb-4">{errors.root.message}</p>
      )}

      {/* Avatar picker */}
      <div className="flex justify-center mb-5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-16 h-16 rounded-full bg-[#2a2640] flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-6 h-6 text-gray-400" />
          )}
          <span className="absolute bottom-0 inset-x-0 bg-black/40 text-[9px] text-white text-center py-0.5">
            {avatarPreview ? 'Change' : 'Photo'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Username"
          {...register('username')}
          className="w-full bg-[#2a2640] p-3 rounded-lg"
        />
        {errors.username && (
          <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
        )}
      </div>

      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          {...register('email')}
          className="w-full bg-[#2a2640] p-3 rounded-lg"
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            {...register('password')}
            className="w-full bg-[#2a2640] p-3 rounded-lg pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-purple-600 hover:bg-purple-700 transition p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending OTP…' : 'Create account'}
      </button>
    </form>
  );
}
