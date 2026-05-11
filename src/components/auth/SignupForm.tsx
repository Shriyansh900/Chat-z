'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '@/validations/auth.schema';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { BASE_URL } from '@/lib/axios';

export default function SignupForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      // Use raw axios — bypasses the 401 refresh interceptor
      const res = await axios.post(`${BASE_URL}/auth/signup`, data, {
        withCredentials: true,
      });
      setAuth(res.data.user, res.data.accessToken);
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

      {errors.root && (
        <p className="text-red-400 text-sm mb-4">{errors.root.message}</p>
      )}

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
