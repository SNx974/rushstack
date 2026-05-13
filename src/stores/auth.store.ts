import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database.types'
import { supabase } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: async (session) => {
    set({ session, user: session?.user ?? null, isAuthenticated: !!session })
    if (session?.user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      set({ profile: data, isLoading: false })
    } else {
      set({ profile: null, isLoading: false })
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  refreshProfile: async () => {
    const { user } = get()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    set({ profile: data })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null, isAuthenticated: false })
  },
}))
