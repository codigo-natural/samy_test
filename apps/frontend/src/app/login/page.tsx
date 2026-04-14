"use client";

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { login } from '@/lib/api/auth';
import { getTraceIdFromAxiosError } from '@/lib/api/client';
import { getMe } from '@/lib/api/me';
import { useActivityStore } from '@/lib/store/activity.store';
import { useAuthStore } from '@/lib/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const addEvent = useActivityStore((s) => s.addEvent);
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      await login(email, password);
    },
    onSuccess: () => {
      getMe()
        .then((me) => setSession(me))
        .catch(() => setSession(null))
        .finally(() => {
          addEvent({ type: 'auth.login', message: `Logged in as ${email}` });
          window.location.href = '/dashboard';
        });
    },
    onError: (e) => {
      const tid = getTraceIdFromAxiosError(e);
      setTraceId(tid ?? null);
      setError('Login failed');
      addEvent({ type: 'auth.login_failed', message: `Login failed for ${email}` });
    },
  });

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    setTraceId(null);
    mutation.mutate();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-background via-background to-muted/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Portal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            User & Posts Management System
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your ReqRes credentials to continue
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label 
                className="text-sm font-medium text-foreground" 
                htmlFor="email"
              >
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none ring-offset-background transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eve.holt@reqres.in"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label 
                className="text-sm font-medium text-foreground" 
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  type="password"
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none ring-offset-background transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">{error}</p>
                  {traceId && (
                    <p className="mt-0.5 text-xs text-destructive/70">
                      Request ID: {traceId}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending || !email || !password}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

          <p className="mt-6 mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Demo Credentials
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setEmail('eve.holt@reqres.in');
                setPassword('cityslicka');
              }}
              className="group w-full rounded-lg border border-border bg-background p-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">eve.holt@reqres.in</p>
                  <p className="text-xs text-muted-foreground">password: cityslicka</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Click to fill
                </span>
              </div>
            </button>
            <div className="bg-background/50 p-2 text-center">
              <p className="text-[11px] text-muted-foreground">
                Or use any email with password <code className="rounded bg-secondary px-1 py-0.5 text-foreground">cityslicka</code>
              </p>
            </div>
          </div>
      </div>
    </div>
  );
}
