'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/validations/auth.schema';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { BASE_URL } from '@/lib/axios';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { connectSocket } from '@/lib/socket';

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
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
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  // Step 1 — send credentials, backend emails OTP
  const onSubmit = async (data: LoginInput) => {
    try {
      await axios.post(`${BASE_URL}/auth/login`, data, {
        withCredentials: true,
      });
      setPendingEmail(data.email);
      setStep('otp');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Login failed. Please try again.')
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
        `${BASE_URL}/auth/verify-login`,
        { email: pendingEmail, otp: otp.trim() },
        { withCredentials: true },
      );
      setAuth(res.data.user, res.data.accessToken);
      connectSocket(res.data.user._id);
      router.push('/chat');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Invalid or expired OTP.')
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
        { email: pendingEmail, purpose: 'login' },
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
        <h2 className="text-3xl font-bold mb-2">Check your email</h2>
        <p className="text-sm text-gray-400 mb-6">
          We sent a 6-digit code to{' '}
          <span className="text-white font-medium">{pendingEmail}</span>. Enter
          it below to sign in.
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
          {otpLoading ? 'Verifying…' : 'Verify & Sign in'}
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
            ← Back
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

  // ── Login form step ───────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="text-3xl font-bold mb-2">Welcome back</h2>

      <p className="text-sm text-gray-400 mb-6">
        Don&apos;t have an account?{' '}
        <span
          onClick={() => router.push('/signup')}
          className="underline cursor-pointer"
        >
          Sign up
        </span>
      </p>

      {errors.root && (
        <p className="text-red-400 text-sm mb-4">{errors.root.message}</p>
      )}

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
        {isSubmitting ? 'Sending OTP…' : 'Login'}
      </button>
    </form>
  );
}
