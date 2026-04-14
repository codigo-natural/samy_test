import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  email?: string;
  role?: string;
  setAuthenticated: (value: boolean) => void;
  setSession: (session: { email?: string; role?: string } | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  email: undefined,
  role: undefined,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setSession: (session) =>
    set(
      session
        ? { isAuthenticated: true, email: session.email, role: session.role }
        : { isAuthenticated: false, email: undefined, role: undefined },
    ),
}));
