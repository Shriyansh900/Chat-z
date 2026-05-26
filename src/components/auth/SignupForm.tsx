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
import {
  Eye,
  EyeOff,
  Camera,
  Shield,
  ArrowRight,
  Mail,
  Lock,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

const OTP_LENGTH = 4;

export default function SignupForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '' },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
    e.target.value = '';
  };

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

  const onSubmit = async (data: SignupInput) => {
    const form = new FormData();
    form.append('username', data.username);
    form.append('email', data.email);
    form.append('password', data.password);
    if (avatarFile) form.append('avatar', avatarFile);

    const toastId = toast.loading('Creating account…');
    try {
      const res = await axios.post(`${BASE_URL}/auth/signup`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
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
          : (err.response?.data?.message ?? 'Signup failed. Please try again.');
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
        `${BASE_URL}/auth/verify-signup`,
        { email: pendingEmail, otp },
        { withCredentials: true },
      );
      toast.dismiss(toastId);
      toast.success('Account created! Welcome 🎉');
      setAuth(res.data.user, res.data.accessToken);
      connectSocket();
      router.push('/chat');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? 'Invalid OTP. Please try again.')
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
        { email: pendingEmail, purpose: 'signup' },
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
      if (!axios.isAxiosError(err)) {
        toast.error('An unexpected error occurred.');
        setResendLoading(false);
        return;
      }
      const status = err.response?.status;
      if (status === 404) {
        toast.error('Session expired. Please sign up again.');
        setTimeout(() => {
          setStep('form');
          setDigits(Array(OTP_LENGTH).fill(''));
        }, 1500);
      } else if (status === 503) {
        toast.error('Failed to send OTP. Please try again.');
      } else {
        toast.error(err.response?.data?.message ?? 'Failed to resend OTP.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  // ── OTP step ──────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} noValidate>
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
              Verify & Continue
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
            ← Back to signup
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

  // ── Signup form step ──────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5df8d8]/10 border border-[#5df8d8]/20 text-[#5df8d8] text-xs font-medium mb-4">
          <Shield size={11} />
          Create Account
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Join NexChat</h2>
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <span
            onClick={() => router.push('/login')}
            className="text-[#6fd1d7] hover:text-[#5df8d8] cursor-pointer transition-colors font-medium"
          >
            Sign in
          </span>
        </p>
      </div>

      {errors.root && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errors.root.message}
        </div>
      )}

      {/* Avatar picker */}
      <div className="flex justify-center mb-5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-18 h-18 group"
        >
          <div
            className="w-18 h-18 rounded-full overflow-hidden border-2 border-[#6fd1d7]/30 group-hover:border-[#5df8d8]/60 transition-colors bg-[#093c5d]/40 flex items-center justify-center"
            style={{ width: 72, height: 72 }}
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera
                size={22}
                className="text-slate-500 group-hover:text-[#6fd1d7] transition-colors"
              />
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-[#5df8d8] to-[#6fd1d7] flex items-center justify-center border-2 border-[#060d14]">
            <Camera size={10} className="text-[#060d14]" />
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

      {/* Username */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
          Username
        </label>
        <div className="relative">
          <User
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="yourname"
            {...register('username')}
            className="w-full glass bg-[#093c5d]/20 text-white placeholder-slate-600 pl-10 pr-4 py-3 rounded-xl border border-[#6fd1d7]/15 focus:border-[#5df8d8]/50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(93,248,216,0.08)] transition-all duration-200 text-sm"
          />
        </div>
        {errors.username && (
          <p className="text-red-400 text-xs mt-1.5 ml-1">
            {errors.username.message}
          </p>
        )}
      </div>

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
      <div className="mb-6">
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
            Creating account…
          </span>
        ) : (
          <>
            Create account
            <ArrowRight size={14} />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 mt-5">
        <Shield size={10} className="text-[#6fd1d7]" />
        <span className="text-[11px] text-slate-600">
          Protected with end-to-end encryption
        </span>
      </div>
    </form>
  );
}
