import { create } from 'zustand'

const API_BASE = 'http://localhost:8000/api/live'

export const useLiveQuizStore = create((set, get) => ({
  // State
  sessions: [],
  currentSession: null,
  currentParticipant: null,
  participants: [],
  leaderboard: [],
  currentQuestion: null,
  questionStartTime: null,
  loading: false,
  error: null,

  // Teacher Actions
  createSession: async (quizId, settings) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE}/sessions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          quiz: quizId,
          ...settings,
        }),
      })

      if (!response.ok) throw new Error('Failed to create session')

      const session = await response.json()
      set({ currentSession: session, loading: false })
      return session
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  startSession: async (sessionId) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/start/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to start session')

      const session = await response.json()
      set({ currentSession: session, questionStartTime: new Date(), loading: false })
      return session
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  nextQuestion: async (sessionId) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/next_question/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to go to next question')

      const data = await response.json()
      set({ 
        currentSession: data.session || data, 
        questionStartTime: new Date(), 
        loading: false 
      })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  endSession: async (sessionId) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/end/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to end session')

      const session = await response.json()
      set({ currentSession: session, loading: false })
      return session
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  fetchParticipants: async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/participants/`)
      if (!response.ok) throw new Error('Failed to fetch participants')

      const participants = await response.json()
      set({ participants })
      return participants
    } catch (error) {
      console.error('Error fetching participants:', error)
      return []
    }
  },

  fetchLeaderboard: async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/leaderboard/`)
      if (!response.ok) throw new Error('Failed to fetch leaderboard')

      const leaderboard = await response.json()
      set({ leaderboard })
      return leaderboard
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
  },

  fetchSession: async (sessionId) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('access_token')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/`, {
        headers,
      })

      if (!response.ok) throw new Error('Failed to fetch session')

      const session = await response.json()
      set({ currentSession: session, loading: false })
      return session
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Student Actions
  verifyJoinCode: async (code) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE}/sessions/verify_code/?code=${code}`)
      
      if (!response.ok) {
        set({ loading: false })
        return { valid: false }
      }

      const data = await response.json()
      set({ loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      return { valid: false }
    }
  },

  joinSession: async (joinCode, nickname = '') => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('access_token')
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}/sessions/join/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          join_code: joinCode.toUpperCase(),
          nickname,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to join session')
      }

      const data = await response.json()
      set({
        currentSession: data.session,
        currentParticipant: data.participant,
        questionStartTime: new Date(),
        loading: false,
      })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  submitAnswer: async (participantId, questionId, selectedOptionId, timeTaken) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}/submit_answer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          selected_option_id: selectedOptionId,
          time_taken: timeTaken,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to submit answer')
      }

      const result = await response.json()
      
      // Update participant score
      if (get().currentParticipant) {
        set({
          currentParticipant: {
            ...get().currentParticipant,
            score: result.total_score,
            correct_answers: result.correct_answers,
          },
          loading: false,
        })
      }

      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  leaveSession: async (participantId) => {
    try {
      await fetch(`${API_BASE}/participants/${participantId}/leave/`, {
        method: 'POST',
      })
      set({ currentSession: null, currentParticipant: null })
    } catch (error) {
      console.error('Error leaving session:', error)
    }
  },

  // Utility
  resetStore: () => {
    set({
      currentSession: null,
      currentParticipant: null,
      participants: [],
      leaderboard: [],
      currentQuestion: null,
      questionStartTime: null,
      error: null,
    })
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
