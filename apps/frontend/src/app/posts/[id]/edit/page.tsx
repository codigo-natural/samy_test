'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2, Save, FileText } from 'lucide-react';

import { getPost, Post, updatePost } from '@/lib/api/posts';
import { getTraceIdFromAxiosError } from '@/lib/api/client';
import { useActivityStore } from '@/lib/store/activity.store';
import { PostForm } from '@/components/post-form';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const queryClient = useQueryClient();
  const addEvent = useActivityStore((s) => s.addEvent);
  const [error, setError] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);

  const query = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    enabled: !!id,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (payload: { title: string; body: string; authorUserId: number }) => {
      await updatePost(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      addEvent({ type: 'posts.update', message: 'Updated post' });
      router.replace(`/posts/${id}`);
    },
    onError: (e) => {
      setTraceId(getTraceIdFromAxiosError(e) ?? null);
      setError('Update failed');
    },
  });

  const post = query.data;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <main className="mx-auto max-w-3xl space-y-4">
        <header className="flex items-center gap-3 pb-6 border-b border-border mb-2">
          <Link 
            href={`/posts/${id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-medium tracking-tight">
              Edit Post
            </h1>
            <p className="text-sm text-muted-foreground">
              Update post content and details
            </p>
          </div>
        </header>

        <div className="bg-surface border border-border rounded-lg flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
          
          <div className="p-6">
            {query.isLoading ? (
              <div className="flex items-center gap-3 text-muted-foreground py-8">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading post...</span>
              </div>
            ) : query.isError ? (
              <div className="flex items-center gap-3 text-destructive py-8">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Failed to load post. Please try again.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{post?.title}</p>
                    <p className="text-xs text-muted-foreground">ID: {id}</p>
                  </div>
                </div>

                <PostForm
                  initial={{ title: post?.title, body: post?.body, authorUserId: post?.authorUserId }}
                  submitLabel={mutation.isPending ? 'Saving…' : 'Save Changes'}
                  onSubmit={async (payload) => {
                    setError(null);
                    setTraceId(null);
                    await mutation.mutateAsync(payload);
                  }}
                />
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
