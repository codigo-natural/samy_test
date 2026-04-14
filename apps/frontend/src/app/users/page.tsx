'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Users, UserPlus } from 'lucide-react';

import {
  deleteSavedUser,
  getSavedUsers,
  importUser,
  PaginatedResponse,
  Role,
  SavedUser,
} from '@/lib/api/users';
import { getTraceIdFromAxiosError } from '@/lib/api/client';
import { useActivityStore } from '@/lib/store/activity.store';
import { useAuthStore } from '@/lib/store/auth.store';

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function UsersPage() {
  const queryClient = useQueryClient();
  const addEvent = useActivityStore((s) => s.addEvent);
  const role = useAuthStore((s) => s.role);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [importId, setImportId] = useState('');
  const [importRole, setImportRole] = useState<Role>('VIEWER');
  const [traceId, setTraceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery<PaginatedResponse<SavedUser>>({
    queryKey: ['users', page, limit],
    queryFn: () => getSavedUsers(page, limit),
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const id = Number(importId);
      return importUser(id, { role: importRole });
    },
    onSuccess: (data) => {
      addEvent({
        type: 'users.import',
        message: `Imported user (role=${importRole}, alreadyExisted=${String(data.alreadyExisted)})`,
      });
      setImportId('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => {
      setTraceId(getTraceIdFromAxiosError(e) ?? null);
      setError('Import failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteSavedUser(id);
    },
    onSuccess: () => {
      addEvent({ type: 'users.delete', message: 'Deleted user' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => {
      setTraceId(getTraceIdFromAxiosError(e) ?? null);
      setError('Delete failed');
    },
  });

  const users = query.data?.data ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const canGoNext = !query.isLoading && page < totalPages;

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

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <main className="mx-auto max-w-5xl space-y-4">
        <header className="flex items-end justify-between pb-6 border-b border-border mb-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-medium tracking-tight">
              Users
            </h1>
            <p className="text-sm text-muted-foreground">
              Import users from ReqRes and manage locally saved records.
            </p>
          </div>
          {role && (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              role === 'ADMIN' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-500' :
              role === 'EDITOR' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' :
              'border-slate-500/30 bg-slate-500/10 text-slate-500'
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {role}
            </span>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between relative overflow-hidden group hover:border-muted-foreground/20 transition-colors duration-300">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
              Total Users
            </span>
            <div className="flex flex-col">
              <span className="text-3xl font-mono text-foreground tracking-tighter tabular-nums">
                {query.data?.total ?? 0}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1">Imported from ReqRes</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between relative overflow-hidden group hover:border-muted-foreground/20 transition-colors duration-300 md:col-span-2">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                Import User
              </span>
              <UserPlus className="w-4 h-4 text-muted-foreground/50" />
            </div>
            
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                inputMode="numeric"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-ring"
                placeholder="ReqRes User ID (e.g. 2)"
                value={importId}
                onChange={(e) => setImportId(e.target.value)}
              />
              <select
                className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
                value={importRole}
                onChange={(e) => setImportRole(e.target.value as typeof importRole)}
              >
                <option value="VIEWER">VIEWER</option>
                <option value="EDITOR">EDITOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button
                className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                disabled={importMutation.isPending || !importId}
                onClick={() => {
                  setError(null);
                  setTraceId(null);
                  importMutation.mutate();
                }}
              >
                {importMutation.isPending ? 'Importing…' : 'Import'}
              </button>
            </div>

            {error ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                <div>{error}</div>
                {traceId ? <div className="text-[10px] text-red-600 dark:text-red-500">Request ID: {traceId}</div> : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
              Saved Users
            </span>
            <div className="flex items-center gap-2">
              <button
                className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-60"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span className="text-xs text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <button
                className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-60"
                disabled={!canGoNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>

          <div className="flex-1">
            {query.isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">No users saved yet.</p>
                <p className="mt-2 text-xs text-muted-foreground/70">
                  Import a user from ReqRes to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-4 p-4 group hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-500">
                        <UserIcon />
                      </div>
                      <div className="min-w-0">
                        <Link 
                          className="block truncate text-sm font-medium text-foreground hover:underline" 
                          href={`/users/${u.id}`}
                        >
                          {u.email}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{u.firstName} {u.lastName}</span>
                          <span className="text-border">·</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getRoleBadgeStyles(u.role)}`}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {role === 'ADMIN' ? (
                      <button
                        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-60 shrink-0"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          setError(null);
                          setTraceId(null);
                          deleteMutation.mutate(u.id);
                        }}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
