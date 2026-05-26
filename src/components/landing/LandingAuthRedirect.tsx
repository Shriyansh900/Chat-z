'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * Invisible component — if the user is already authenticated,
 * redirect them from the landing page to /chat.
 */
export default function LandingAuthRedirect() {
  const { accessToken, _hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hydrated && accessToken) {
      router.replace('/chat');
    }
  }, [_hydrated, accessToken, router]);

  return null;
}
