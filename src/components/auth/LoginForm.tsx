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

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      // Use raw axios — bypasses the 401 refresh interceptor on wrong password
      const res = await axios.post(`${BASE_URL}/auth/login`, data, {
        withCredentials: true,
      });
      setAuth(res.data.user, res.data.accessToken);
      router.push('/chat');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Login failed. Please try again.')
        : 'An unexpected error occurred.';
      setError('root', { message });
    }
  };

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
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
