'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import type { AuthResponse } from '@/types/user';
import axios from 'axios';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const res = await api.post<AuthResponse>('/auth/signup', data);
      localStorage.setItem('token', res.data.token);
      router.push('/chat');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Signup failed. Please try again.')
        : 'An unexpected error occurred.';

      setError('root', { message });
    }
  };

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

      {/* Root error */}
      {errors.root && (
        <p className="text-red-400 text-sm mb-4">{errors.root.message}</p>
      )}

      {/* Username */}
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

      {/* Email */}
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

      {/* Password */}
      <div className="mb-6">
        <input
          type="password"
          placeholder="Password"
          {...register('password')}
          className="w-full bg-[#2a2640] p-3 rounded-lg"
        />
        {errors.password && (
          <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-purple-600 hover:bg-purple-700 transition p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
