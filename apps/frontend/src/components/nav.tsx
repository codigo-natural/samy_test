'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, LogOut, User } from 'lucide-react';

import { logout } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth.store';
import { useActivityStore } from '@/lib/store/activity.store';
import { ThemeToggleSimple } from './theme-toggle';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/posts', label: 'Posts', icon: FileText },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      <span>{item.label}</span>
      {active && (
        <span className="bg-primary h-1.5 w-1.5 rounded-full" />
      )}
    </Link>
  );
}

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { email, role, setSession } = useAuthStore();
  const addEvent = useActivityStore((s) => s.addEvent);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      setSession(null);
      addEvent({ type: 'auth.logout', message: 'Logged out' });
      router.replace('/login');
    },
  });

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'EDITOR':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'VIEWER':
        return 'bg-info/10 text-info border-info/20';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="group flex items-center gap-2.5">
            <div className="hidden sm:block">
              <div className="text-sm font-bold tracking-tight text-foreground">
                Portal
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">
                Users & Posts
              </div>
            </div>
          </Link>
          
          <nav className="hidden md:ml-8 md:flex md:items-center md:gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-1 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>

          <div className="hidden sm:block">
            <ThemeToggleSimple />
          </div>

          {pathname !== '/login' && (
            <div className="hidden items-center gap-2 border-l border-border pl-2 sm:flex md:pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="hidden text-left lg:block">
                {email && (
                  <div className="max-w-35 truncate text-sm font-medium text-foreground">
                    {email}
                  </div>
                )}
                {role && (
                  <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getRoleBadgeColor(role)}`}>
                    {role}
                  </span>
                )}
              </div>
            </div>
          )}

          {pathname !== '/login' && (
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="group flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 sm:h-9 sm:w-auto sm:px-3"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="ml-2 hidden text-sm font-medium sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
