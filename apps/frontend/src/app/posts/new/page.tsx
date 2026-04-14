'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, FilePlus, Sparkles } from 'lucide-react';

import { createPost } from '@/lib/api/posts';
import { getTraceIdFromAxiosError } from '@/lib/api/client';
import { useActivityStore } from '@/lib/store/activity.store';
import { PostForm } from '@/components/post-form';

export default function NewPostPage() {
  const router = useRouter();
  const addEvent = useActivityStore((s) => s.addEvent);
  const [error, setError] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: { title: string; body: string; authorUserId: number }) => {
      await createPost(payload);
    },
    onSuccess: () => {
      addEvent({ type: 'posts.create', message: 'Created post' });
      router.replace('/posts');
    },
    onError: (e) => {
      setTraceId(getTraceIdFromAxiosError(e) ?? null);
      setError('Create failed');
    },
  });

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <main className="mx-auto max-w-3xl space-y-4">
        <header className="flex items-center gap-3 pb-6 border-b border-border mb-2">
          <Link 
            href="/posts"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-medium tracking-tight">
              New Post
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new post in the portal
            </p>
          </div>
        </header>

        <div className="bg-surface border border-border rounded-lg flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
          
          <div className="p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <FilePlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Create New Content</p>
                <p className="text-xs text-muted-foreground">Fill in the details below</p>
              </div>
            </div>

            <PostForm
              submitLabel={mutation.isPending ? 'Creating…' : 'Create Post'}
              onSubmit={async (payload) => {
                setError(null);
                setTraceId(null);
                await mutation.mutateAsync(payload);
              }}
            />

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
