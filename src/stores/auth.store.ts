import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/services/profile.service';
import type { AuthUser, Profile } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface AuthStore {
  user: AuthUser | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setSession: (session: Session | null) => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: async (session) => {
    if (!session) {
      set({ user: null, profile: null, session: null, isAuthenticated: false, isLoading: false });
      return;
    }

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email ?? null,
      phone: session.user.phone ?? null,
    };

    set({ user, session, isAuthenticated: true, isLoading: true });

    try {
      const profile = await fetchProfile(session.user.id);
      set({ profile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setProfile: (profile) => set({ profile }),

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const profile = await fetchProfile(user.id);
      set({ profile });
    } catch {
      // silently fail
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, session: null, isAuthenticated: false });
  },
}));
