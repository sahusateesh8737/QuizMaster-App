import create from 'zustand';

const useQuizStore = create((set) => ({
  quizzes: [],
  currentQuiz: null,
  currentAttempt: null,
  loading: false,

  setQuizzes: (quizzes) => set({ quizzes }),
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setCurrentAttempt: (attempt) => set({ currentAttempt: attempt }),
  setLoading: (loading) => set({ loading }),

  clearCurrentQuiz: () => set({ currentQuiz: null, currentAttempt: null }),
}));

export default useQuizStore;
