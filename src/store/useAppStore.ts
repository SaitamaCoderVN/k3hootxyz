import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Quiz {
  quizId: number;
  question: string;
  rewardAmount: number;
  winner: string | null;
  isClaimed: boolean;
}

interface User {
  walletAddress: string | null;
  totalRewards: number;
  quizzesCompleted: number;
}

interface AppState {
  // User State
  user: User;
  setUser: (user: Partial<User>) => void;
  clearUser: () => void;

  // Quiz State
  quizzes: Quiz[];
  availableQuizzes: Quiz[];
  completedQuizzes: Quiz[];
  setQuizzes: (quizzes: Quiz[]) => void;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (quizId: number, updates: Partial<Quiz>) => void;

  // UI State
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Wallet State
  isWalletConnected: boolean;
  setWalletConnected: (connected: boolean) => void;
}

const initialUser: User = {
  walletAddress: null,
  totalRewards: 0,
  quizzesCompleted: 0,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User State
      user: initialUser,
      setUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
      clearUser: () => set({ user: initialUser }),

      // Quiz State
      quizzes: [],
      availableQuizzes: [],
      completedQuizzes: [],
      setQuizzes: (quizzes) => {
        const available = quizzes.filter((q) => !q.winner);
        const completed = quizzes.filter((q) => q.winner);
        set({ quizzes, availableQuizzes: available, completedQuizzes: completed });
      },
      addQuiz: (quiz) =>
        set((state) => {
          const newQuizzes = [...state.quizzes, quiz];
          const available = newQuizzes.filter((q) => !q.winner);
          const completed = newQuizzes.filter((q) => q.winner);
          return {
            quizzes: newQuizzes,
            availableQuizzes: available,
            completedQuizzes: completed,
          };
        }),
      updateQuiz: (quizId, updates) =>
        set((state) => {
          const newQuizzes = state.quizzes.map((q) =>
            q.quizId === quizId ? { ...q, ...updates } : q
          );
          const available = newQuizzes.filter((q) => !q.winner);
          const completed = newQuizzes.filter((q) => q.winner);
          return {
            quizzes: newQuizzes,
            availableQuizzes: available,
            completedQuizzes: completed,
          };
        }),

      // UI State
      isLoading: false,
      error: null,
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Wallet State
      isWalletConnected: false,
      setWalletConnected: (connected) => set({ isWalletConnected: connected }),
    }),
    {
      name: 'k3hoot-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        quizzes: state.quizzes,
      }),
    }
  )
);
