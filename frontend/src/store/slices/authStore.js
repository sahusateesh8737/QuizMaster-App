import { create } from 'zustand'
import authService from '../../services/auth'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  loading: false,
  error: null,
  isInitialized: false,

  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const data = await authService.login(username, password)
      set({ token: data.access })
      
      // Fetch user data after successful login
      try {
        const user = await authService.getCurrentUser()
        set({ user, loading: false })
      } catch (userError) {
        set({ loading: false })
      }
      
      return data
    } catch (error) {
      set({ error: error.message || 'Login failed', loading: false })
      throw error
    }
  },

  signup: async (userData) => {
    set({ loading: true, error: null })
    try {
      const data = await authService.signup(userData)
      set({ loading: false })
      return data
    } catch (error) {
      set({ error: error.message || 'Signup failed', loading: false })
      throw error
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, token: null })
  },

  getCurrentUser: async () => {
    set({ loading: true })
    try {
      const user = await authService.getCurrentUser()
      set({ user, loading: false, isInitialized: true })
      return user
    } catch (error) {
      set({ error: error.message || 'Failed to fetch user', loading: false, isInitialized: true })
      throw error
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const user = await authService.getCurrentUser()
        set({ user, token, isInitialized: true })
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, token: null, isInitialized: true })
      }
    } else {
      set({ isInitialized: true })
    }
  },

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
