'use client';

import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  init: () => void;
}

function applyTheme(theme: Theme): 'light' | 'dark' {
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  return resolved;
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem('portal-theme');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.theme) return parsed.state.theme;
    }
  } catch {}
  return 'system';
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  setTheme: (theme) => {
    const resolved = applyTheme(theme);
    set({ theme, resolvedTheme: resolved });
    localStorage.setItem('portal-theme', JSON.stringify({ state: { theme } }));
  },

  toggleTheme: () => {
    const current = get().resolvedTheme;
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    set({ theme: next, resolvedTheme: next });
    localStorage.setItem('portal-theme', JSON.stringify({ state: { theme: next } }));
  },

  init: () => {
    const stored = getStoredTheme();
    const resolved = applyTheme(stored);
    set({ theme: stored, resolvedTheme: resolved });
  },
}));
