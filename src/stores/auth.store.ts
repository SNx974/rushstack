import { create } from 'zustand'
import { api } from '@/lib/api'

export interface User {
  id: string
  email: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'player' | 'moderator' | 'admin'
  is_banned: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  signOut: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    const token = localStorage.getItem('token')
    if (!token) { set({ isLoading: false }); return }
    try {
      const user = await api.get<User>('/auth/me')
      set({ user, token, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email, password) => {
    const { token, user } = await api.post<{ token: string; user: User }>('/auth/login', { email, password })
    localStorage.setItem('token', token)
    set({ token, user, isAuthenticated: true })
  },

  register: async (email, password, username) => {
    const { token, user } = await api.post<{ token: string; user: User }>('/auth/register', { email, password, username })
    localStorage.setItem('token', token)
    set({ token, user, isAuthenticated: true })
  },

  signOut: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, isAuthenticated: false })
  },

  setLoading: (isLoading) => set({ isLoading }),
}))
