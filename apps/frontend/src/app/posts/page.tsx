'use client';

import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';

import { getPosts, deletePost, PaginatedResponse, Post } from '@/lib/api/posts';
import { getTraceIdFromAxiosError } from '@/lib/api/client';
import { useActivityStore } from '@/lib/store/activity.store';
import { useAuthStore } from '@/lib/store/auth.store';

const PostIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function PostsPage() {
  const addEvent = useActivityStore((s) => s.addEvent);
  const role = useAuthStore((s) => s.role);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [error, setError] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);

  const query = useQuery<PaginatedResponse<Post>>({
    queryKey: ['posts', page, limit],
    queryFn: () => getPosts(page, limit),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deletePost(id);
    },
    onSuccess: () => {
      addEvent({ type: 'posts.delete', message: 'Deleted post' });
      query.refetch();
    },
    onError: (e) => {
      setTraceId(getTraceIdFromAxiosError(e) ?? null);
      setError('Delete failed');
    },
  });

  const posts = query.data?.data ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const canGoNext = !query.isLoading && page < totalPages;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <main className="mx-auto max-w-5xl space-y-4">
        <header className="flex items-end justify-between pb-6 border-b border-border mb-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-medium tracking-tight">
              Posts
            </h1>
            <p className="text-sm text-muted-foreground">
              Create posts and manage saved posts.
            </p>
          </div>
          <Link
            href="/posts/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <PostIcon />
            New post
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between relative overflow-hidden group hover:border-muted-foreground/20 transition-colors duration-300">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
              Total Posts
            </span>
            <div className="flex flex-col">
              <span className="text-3xl font-mono text-foreground tracking-tighter tabular-nums">
                {query.data?.total ?? 0}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1">Created in portal</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between relative overflow-hidden group hover:border-muted-foreground/20 transition-colors duration-300 md:col-span-2">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                Quick Action
              </span>
              <Sparkles className="w-4 h-4 text-muted-foreground/50" />
            </div>
            <Link href="/posts/new" className="flex items-end justify-between group/link">
              <div className="flex flex-col">
                <span className="text-foreground font-medium text-sm">Create New Post</span>
                <span className="text-[11px] text-muted-foreground mt-1">Write fresh content</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/link:text-foreground transition-colors" />
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            <div>{error}</div>
            {traceId ? <div className="mt-1 text-xs text-red-600 dark:text-red-500">Request ID: {traceId}</div> : null}
          </div>
        ) : null}

        <div className="bg-surface border border-border rounded-lg flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
              Saved Posts
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
            ) : posts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-3">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">No posts saved yet.</p>
                <Link 
                  href="/posts/new" 
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  Create your first post →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {posts.map((p) => (
                  <div key={p.id} className="flex items-start justify-between gap-4 p-4 group hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                        <PostIcon />
                      </div>
                      <div className="min-w-0">
                        <Link 
                          className="block truncate text-sm font-medium text-foreground hover:underline" 
                          href={`/posts/${p.id}`}
                        >
                          {p.title}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.body}</p>
                        <p className="mt-2 text-[11px] text-muted-foreground/70">
                          By User #{p.authorUserId}
                        </p>
                      </div>
                    </div>
                    {role === 'ADMIN' ? (
                      <button
                        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-60 shrink-0"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          setError(null);
                          setTraceId(null);
                          deleteMutation.mutate(p.id);
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
