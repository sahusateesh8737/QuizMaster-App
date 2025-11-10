import { create } from 'zustand'
import resultsService from '../../services/results'

export const useResultsStore = create((set) => ({
  results: [],
  leaderboard: [],
  statistics: null,
  badges: [],
  loading: false,
  error: null,

  getUserResults: async () => {
    set({ loading: true, error: null })
    try {
      const data = await resultsService.getUserResults()
      set({ results: Array.isArray(data) ? data : data.results || [], loading: false })
      return data
    } catch (error) {
      set({ error: error.message || 'Failed to fetch results', results: [], loading: false })
      return []
    }
  },

  getLeaderboard: async (quizId = null, limit = 10) => {
    set({ loading: true, error: null })
    try {
      const data = await resultsService.getLeaderboard(quizId, limit)
      set({ leaderboard: Array.isArray(data) ? data : data.results || [], loading: false })
      return data
    } catch (error) {
      set({ error: error.message || 'Failed to fetch leaderboard', loading: false })
      throw error
    }
  },

  getUserStatistics: async () => {
    set({ loading: true, error: null })
    try {
      const data = await resultsService.getUserStatistics()
      set({ statistics: data, loading: false })
      return data
    } catch (error) {
      set({ error: error.message || 'Failed to fetch statistics', statistics: null, loading: false })
      return null
    }
  },

  getUserBadges: async () => {
    set({ loading: true, error: null })
    try {
      const data = await resultsService.getUserBadges()
      set({ badges: Array.isArray(data) ? data : data.results || [], loading: false })
      return data
    } catch (error) {
      set({ error: error.message || 'Failed to fetch badges', badges: [], loading: false })
      return []
    }
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
