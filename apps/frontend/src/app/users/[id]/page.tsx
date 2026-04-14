'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, User, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { getSavedUser, importUser, SavedUser, Role } from '@/lib/api/users';
import { getTraceIdFromAxiosError } from '@/lib/api/client';
import { useActivityStore } from '@/lib/store/activity.store';

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const getRoleBadgeStyles = (userRole: Role) => {
  switch (userRole) {
    case 'ADMIN':
      return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-500';
    case 'EDITOR':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-500';
    default:
      return 'border-slate-500/30 bg-slate-500/10 text-slate-500';
  }
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const isValidId = !Number.isNaN(id);

  const queryClient = useQueryClient();
  const addEvent = useActivityStore((s) => s.addEvent);
  const [error, setError] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);

  const query = useQuery<SavedUser>({
    queryKey: ['user', id],
    queryFn: () => getSavedUser(id),
    enabled: isValidId,
    retry: false,
  });

  const notFoundLocally =
    axios.isAxiosError(query.error) && query.error.response?.status === 404;

  const importMutation = useMutation({
    mutationFn: async () => {
      return importUser(id);
    },
    onSuccess: () => {
      addEvent({ type: 'users.import', message: `Imported user ${id}` });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => {
      setTraceId(getTraceIdFromAxiosError(e) ?? null);
      setError('Import failed');
    },
  });

  const user = query.data;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <main className="mx-auto max-w-3xl space-y-4">
        <header className="flex items-center gap-3 pb-6 border-b border-border mb-2">
          <Link 
            href="/users" 
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-medium tracking-tight">
              User Details
            </h1>
            <p className="text-sm text-muted-foreground">
              ID: {id}
            </p>
          </div>
        </header>

        <div className="bg-surface border border-border rounded-lg flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
          
          <div className="p-6">
            {!isValidId ? (
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Invalid user ID</span>
              </div>
            ) : query.isLoading ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading user data...</span>
              </div>
            ) : user ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover border border-border"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                      <UserIcon />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-semibold text-foreground">
                        {user.firstName} {user.lastName}
                      </h2>
                      <span className={`rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getRoleBadgeStyles(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-xs text-foreground/60">
                      {user.firstName?.[0]}{user.lastName?.[0]}@{user.email?.split('@')[1]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Saved locally in database
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                      User ID
                    </span>
                    <p className="mt-1 text-sm font-mono text-foreground">{user.id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                      ReqRes ID
                    </span>
                    <p className="mt-1 text-sm font-mono text-foreground">{user.reqresId || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                      First Name
                    </span>
                    <p className="mt-1 text-sm text-foreground">{user.firstName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                      Last Name
                    </span>
                    <p className="mt-1 text-sm text-foreground">{user.lastName}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                      Email Address
                    </span>
                    <p className="mt-1 text-sm font-mono text-foreground">{user.email}</p>
                  </div>
                  {user.avatar && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                        Avatar URL
                      </span>
                      <p className="mt-1 text-xs font-mono text-muted-foreground truncate">{user.avatar}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : notFoundLocally ? (
              <div className="text-center py-8">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
                  <User className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-medium text-foreground">User not found locally</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This user exists in ReqRes but hasn&apos;t been imported yet.
                </p>
                <button
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                  disabled={importMutation.isPending}
                  onClick={() => {
                    setError(null);
                    setTraceId(null);
                    importMutation.mutate();
                  }}
                >
                  {importMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Import from ReqRes
                    </>
                  )}
                </button>
              </div>
            ) : query.isError ? (
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Failed to load user. Please try again.</span>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
                  <User className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-medium text-foreground">User not found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This user doesn&apos;t exist in ReqRes or locally.
                </p>
                <Link 
                  href="/users" 
                  className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Users
                </Link>
              </div>
            )}

            {error ? (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
                {traceId ? <div className="mt-1 text-xs text-red-600 dark:text-red-500">Request ID: {traceId}</div> : null}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
