'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/validations/auth.schema';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { BASE_URL } from '@/lib/axios';
import { Eye, EyeOff, Shield, ArrowRight, Mail, Lock } from 'lucide-react';
import { connectSocket } from '@/lib/socket';
import toast from 'react-hot-toast';

const OTP_LENGTH = 4;

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otp = digits.join('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const onSubmit = async (data: LoginInput) => {
    const toastId = toast.loading('Sending OTP…');
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, data, {
        withCredentials: true,
      });
      toast.dismiss(toastId);
      const otpFromApi = res.data?.otp;
      if (otpFromApi)
        toast.success(`Your OTP is: ${otpFromApi}`, { duration: 15000 });
      else toast.success('OTP sent!');
      setPendingEmail(data.email);
      setStep('otp');
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      toast.dismiss(toastId);
      if (!axios.isAxiosError(err)) {
        toast.error('An unexpected error occurred.');
        setError('root', { message: 'An unexpected error occurred.' });
        return;
      }
      const status = err.response?.status;
      const msg =
        status === 503
          ? 'Failed to send OTP. Please try again.'
          : (err.response?.data?.message ?? 'Login failed. Please try again.');
      toast.error(msg);
      setError('root', { message: msg });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < OTP_LENGTH) {
      toast.error(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    setOtpLoading(true);
    const toastId = toast.loading('Verifying OTP…');
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/verify-login`,
        { email: pendingEmail, otp },
        { withCredentials: true },
      );
      toast.dismiss(toastId);
      toast.success('Signed in successfully!');
      setAuth(res.data.user, res.data.accessToken);
      connectSocket();
      router.push('/chat');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? 'Invalid or expired OTP.')
          : 'An unexpected error occurred.',
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    const toastId = toast.loading('Resending OTP…');
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/resend-otp`,
        { email: pendingEmail, purpose: 'login' },
        { withCredentials: true },
      );
      toast.dismiss(toastId);
      const otpFromApi = res.data?.otp;
      if (otpFromApi)
        toast.success(`New OTP: ${otpFromApi}`, { duration: 15000 });
      else toast.success('New OTP sent!');
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? 'Failed to resend OTP.')
          : 'An unexpected error occurred.',
      );
    } finally {
      setResendLoading(false);
    }
  };

  // ── OTP step ──────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <form
        onSubmit={handleVerifyOtp}
        noValidate
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5df8d8]/10 border border-[#5df8d8]/20 text-[#5df8d8] text-xs font-medium mb-4">
            <Shield size={11} />
            OTP Verification
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            Check your email
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            A {OTP_LENGTH}-digit code was sent to{' '}
            <span className="text-[#6fd1d7] font-medium">{pendingEmail}</span>
          </p>
        </div>

        {/* OTP boxes */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleDigitKeyDown(i, e)}
              onPaste={i === 0 ? handleDigitPaste : undefined}
              className="w-14 h-14 glass rounded-xl text-center text-2xl font-bold font-mono text-white border-2 border-[#6fd1d7]/20 focus:border-[#5df8d8] focus:outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(93,248,216,0.1)] bg-[#093c5d]/30"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={otpLoading || otp.length < OTP_LENGTH}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-[#060d14] bg-gradient-to-r from-[#5df8d8] to-[#6fd1d7] hover:from-[#4ae8c8] hover:to-[#5fc1c7] transition-all duration-300 shadow-lg shadow-[#5df8d8]/20 hover:shadow-[#5df8d8]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mb-4"
        >
          {otpLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#060d14]/30 border-t-[#060d14] rounded-full animate-spin" />
              Verifying…
            </span>
          ) : (
            <>
              <Shield size={15} />
              Verify & Sign in
              <ArrowRight size={14} />
            </>
          )}
        </button>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setStep('form');
              setDigits(Array(OTP_LENGTH).fill(''));
            }}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-[#6fd1d7] hover:text-[#5df8d8] transition-colors disabled:opacity-50"
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
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5df8d8]/10 border border-[#5df8d8]/20 text-[#5df8d8] text-xs font-medium mb-4">
          <Shield size={11} />
          Secure Login
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
        <p className="text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <span
            onClick={() => router.push('/signup')}
            className="text-[#6fd1d7] hover:text-[#5df8d8] cursor-pointer transition-colors font-medium"
          >
            Sign up free
          </span>
        </p>
      </div>

      {errors.root && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errors.root.message}
        </div>
      )}

      {/* Email */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
          Email
        </label>
        <div className="relative">
          <Mail
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className="w-full glass bg-[#093c5d]/20 text-white placeholder-slate-600 pl-10 pr-4 py-3 rounded-xl border border-[#6fd1d7]/15 focus:border-[#5df8d8]/50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(93,248,216,0.08)] transition-all duration-200 text-sm"
          />
        </div>
        {errors.email && (
          <p className="text-red-400 text-xs mt-1.5 ml-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-7">
        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
          Password
        </label>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
            className="w-full glass bg-[#093c5d]/20 text-white placeholder-slate-600 pl-10 pr-11 py-3 rounded-xl border border-[#6fd1d7]/15 focus:border-[#5df8d8]/50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(93,248,216,0.08)] transition-all duration-200 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-400 text-xs mt-1.5 ml-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-[#060d14] bg-gradient-to-r from-[#5df8d8] to-[#6fd1d7] hover:from-[#4ae8c8] hover:to-[#5fc1c7] transition-all duration-300 shadow-lg shadow-[#5df8d8]/20 hover:shadow-[#5df8d8]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#060d14]/30 border-t-[#060d14] rounded-full animate-spin" />
            Sending OTP…
          </span>
        ) : (
          <>
            Login
            <ArrowRight size={14} />
          </>
        )}
      </button>

      {/* Encryption note */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        <Shield size={10} className="text-[#6fd1d7]" />
        <span className="text-[11px] text-slate-600">
          Protected with end-to-end encryption
        </span>
      </div>
    </form>
  );
}
