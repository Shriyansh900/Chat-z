import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  // Persisted — survives page refresh
  user: User | null;

  // In-memory only — refreshed via httpOnly cookie on every page load
  accessToken: string | null;

  // True once the persisted store has rehydrated from localStorage
  _hydrated: boolean;

  setAuth: (user: User, token: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      _hydrated: false,

      setAuth: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null }),
      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: 'auth-storage',
      // Only persist user — access token is short-lived, re-fetched via refresh cookie
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
