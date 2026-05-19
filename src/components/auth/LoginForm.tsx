'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/validations/auth.schema';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { BASE_URL } from '@/lib/axios';
import { Eye, EyeOff } from 'lucide-react';
import { connectSocket } from '@/lib/socket';
import toast from 'react-hot-toast';

const OTP_LENGTH = 4;

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  // OTP step
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

  // ── OTP box handlers ──────────────────────────────────────
  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  // Step 1 — send credentials
  const onSubmit = async (data: LoginInput) => {
    const toastId = toast.loading('Sending OTP…');
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, data, {
        withCredentials: true,
      });
      toast.dismiss(toastId);
      const otpFromApi = res.data?.otp;
      if (otpFromApi) {
        toast.success(`Your OTP is: ${otpFromApi}`, { duration: 15000 });
      } else {
        toast.success('OTP sent!');
      }
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

  // Step 2 — verify OTP
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
      connectSocket(res.data.user._id);
      router.push('/chat');
    } catch (err) {
      toast.dismiss(toastId);
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Invalid or expired OTP.')
        : 'An unexpected error occurred.';
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
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
      if (otpFromApi) {
        toast.success(`New OTP: ${otpFromApi}`, { duration: 15000 });
      } else {
        toast.success('New OTP sent!');
      }
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      toast.dismiss(toastId);
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to resend OTP.')
        : 'An unexpected error occurred.';
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  // ── OTP step ──────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} noValidate>
        <h2 className="text-3xl font-bold mb-2">Enter your OTP</h2>
        <p className="text-sm text-gray-400 mb-8">
          A {OTP_LENGTH}-digit code was sent for{' '}
          <span className="text-white font-medium">{pendingEmail}</span>.
        </p>

        {/* 4-box OTP input */}
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
              className="w-14 h-14 bg-[#2a2640] rounded-xl text-center text-2xl font-bold font-mono text-white border-2 border-transparent focus:border-purple-500 focus:outline-none transition-colors"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={otpLoading || otp.length < OTP_LENGTH}
          className="w-full bg-purple-600 hover:bg-purple-700 transition p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {otpLoading ? 'Verifying…' : 'Verify & Sign in'}
        </button>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setStep('form');
              setDigits(Array(OTP_LENGTH).fill(''));
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
