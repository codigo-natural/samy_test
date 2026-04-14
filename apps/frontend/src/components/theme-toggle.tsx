'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, Theme } from '@/lib/store/theme.store';

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();

  const currentIcon = themeOptions.find((t) => t.value === theme)?.icon ?? Sun;
  const Icon = currentIcon;
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
      {/* Quick toggle button */}
      <button
        onClick={toggleTheme}
        className="group relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">
          Current theme: {theme}, click to toggle
        </span>
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-border" />

      {/* Theme selector */}
      <div className="flex items-center gap-0.5">
        {themeOptions.map(({ value, icon: OptionIcon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex h-7 w-7 items-center justify-center rounded transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
              theme === value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            aria-label={`Set theme to ${value}`}
            aria-pressed={theme === value}
            title={`${value} mode`}
          >
            <OptionIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ThemeToggleSimple() {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center text-foreground shadow-sm transition-colors cursor-pointer"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
