import create from 'zustand';
import { devtools } from 'zustand/middleware';

const useAuthStore = create(
  devtools((set) => ({
    user: null,
    isAuthenticated: false,
    loading: false,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setLoading: (loading) => set({ loading }),
    logout: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false });
    },
  }))
);

export default useAuthStore;
