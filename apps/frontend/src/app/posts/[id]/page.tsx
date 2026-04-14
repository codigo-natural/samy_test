'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, AlertCircle, Loader2, Edit2 } from 'lucide-react';

import { getPost, Post } from '@/lib/api/posts';
import { useAuthStore } from '@/lib/store/auth.store';

const PostIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const role = useAuthStore((s) => s.role);

  const query = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    enabled: !!id,
    retry: false,
  });

  const post = query.data;

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
              Post Details
            </h1>
            <p className="text-sm text-muted-foreground">
              ID: {id}
            </p>
          </div>
        </header>

        <div className="bg-surface border border-border rounded-lg flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
          
          <div className="p-6">
            {query.isLoading ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading post...</span>
              </div>
            ) : query.isError ? (
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Failed to load post. Please try again.</span>
              </div>
            ) : !post ? (
              <div className="text-center py-8">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
                  <FileText className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Post not found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This post doesn&apos;t exist in the database.
                </p>
                <Link 
                  href="/posts" 
                  className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Posts
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <PostIcon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-foreground leading-tight">
                      {post.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      By User #{post.authorUserId}
                    </p>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                  {role === 'ADMIN' || role === 'EDITOR' ? (
                    <Link
                      href={`/posts/${id}/edit`}
                      className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Post
                    </Link>
                  ) : null}
                  <Link 
                    href="/posts" 
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
