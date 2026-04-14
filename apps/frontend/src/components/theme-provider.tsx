'use client';

import { useEffect, ReactNode } from 'react';
import { useThemeStore } from '@/lib/store/theme.store';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const init = useThemeStore((s) => s.init);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => init();

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme, init]);

  return <>{children}</>;
}
