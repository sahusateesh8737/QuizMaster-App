import { create } from 'zustand'
import quizService from '../../services/quiz'

export const useQuizStore = create((set) => ({
  quizzes: [],
  categories: [],
  currentQuiz: null,
  currentAttempt: null,
  loading: false,
  error: null,

  getCategories: async () => {
    set({ loading: true, error: null })
    try {
      const data = await quizService.getCategories()
      set({ categories: Array.isArray(data) ? data : data.results || [], loading: false })
      return data
    } catch (error) {
      set({ error: error.message || 'Failed to fetch categories', categories: [], loading: false })
      return []
    }
  },

  getQuizzes: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const data = await quizService.getQuizzes(params)
      set({ quizzes: Array.isArray(data) ? data : data.results || [], loading: false })
      return data
    } catch (error) {
      set({ error: error.message || 'Failed to fetch quizzes', quizzes: [], loading: false })
      return []
    }
  },

  getQuizDetail: async (id) => {
    set({ loading: true, error: null })
    try {
      const quiz = await quizService.getQuizDetail(id)
      set({ currentQuiz: quiz, loading: false })
      return quiz
    } catch (error) {
      set({ error: error.message || 'Failed to fetch quiz', loading: false })
      throw error
    }
  },

  startAttempt: async (quizId) => {
    set({ loading: true, error: null })
    try {
      // Get quiz details to have questions
      const quiz = await quizService.getQuizDetail(quizId)
      
      // Start the attempt
      const attempt = await quizService.startAttempt(quizId)
      
      // Combine attempt with quiz questions and time limit
      const attemptWithQuestions = {
        ...attempt,
        questions: quiz.questions || [],
        time_limit: quiz.time_limit,
      }
      
      set({ currentAttempt: attemptWithQuestions, currentQuiz: quiz, loading: false })
      return attemptWithQuestions
    } catch (error) {
      set({ error: error.detail || error.message || 'Failed to start quiz', loading: false })
      throw error
    }
  },

  submitAnswer: async (attemptId, questionId, selectedOptionId, answerText = '') => {
    try {
      const data = await quizService.submitAnswer(attemptId, questionId, selectedOptionId, answerText)
      // Update the current attempt's answers
      set((state) => {
        const updatedAnswers = state.currentAttempt.answers || []
        const existingIndex = updatedAnswers.findIndex(a => a.question === questionId)
        
        const newAnswer = {
          question: questionId,
          selected_option: selectedOptionId,
          answer_text: answerText,
          is_correct: data.is_correct,
        }
        
        if (existingIndex >= 0) {
          updatedAnswers[existingIndex] = newAnswer
        } else {
          updatedAnswers.push(newAnswer)
        }
        
        return {
          currentAttempt: {
            ...state.currentAttempt,
            answers: updatedAnswers,
          },
        }
      })
      return data
    } catch (error) {
      set({ error: error.detail || error.message || 'Failed to submit answer' })
      throw error
    }
  },

  finishAttempt: async (attemptId) => {
    set({ loading: true })
    try {
      const result = await quizService.finishAttempt(attemptId)
      set({ currentAttempt: null, loading: false })
      return result
    } catch (error) {
      set({ error: error.message || 'Failed to finish quiz', loading: false })
      throw error
    }
  },

  searchQuizzes: async (searchTerm, category = null) => {
    set({ loading: true, error: null })
    try {
      const data = await quizService.searchQuizzes(searchTerm, category)
      set({ quizzes: Array.isArray(data) ? data : data.results || [], loading: false })
      return data
    } catch (error) {
      set({ error: error.message || 'Search failed', quizzes: [], loading: false })
      return []
    }
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
