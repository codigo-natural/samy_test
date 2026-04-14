'use client';

import { FormEvent, useState } from 'react';
import { Type, FileText, User, AlertCircle, Loader2 } from 'lucide-react';

import { getSavedUsers, SavedUser } from '@/lib/api/users';
import { useQuery } from '@tanstack/react-query';

interface PostFormProps {
  initial?: { title?: string; body?: string; authorUserId?: number };
  submitLabel: string;
  onSubmit: (payload: { title: string; body: string; authorUserId: number }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function PostForm({ initial, submitLabel, onSubmit, isSubmitting }: PostFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [authorUserId, setAuthorUserId] = useState(String(initial?.authorUserId ?? ''));
  const [errors, setErrors] = useState<{ title?: string; body?: string; authorUserId?: string }>({});
  const [touched, setTouched] = useState({ title: false, body: false, authorUserId: false });

  const usersQuery = useQuery({
    queryKey: ['users', 1, 100],
    queryFn: () => getSavedUsers(1, 100),
  });

  const users: SavedUser[] = usersQuery.data?.data ?? [];

  const validate = () => {
    const e: typeof errors = {};

    if (title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (title.trim().length > 100) e.title = 'Title must be less than 100 characters';
    
    if (body.trim().length < 10) e.body = 'Body must be at least 10 characters';
    if (body.trim().length > 5000) e.body = 'Body must be less than 5000 characters';

    const parsed = Number(authorUserId);
    if (!authorUserId || Number.isNaN(parsed) || parsed <= 0) {
      e.authorUserId = 'Please select a valid author';
    }

    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    
    setTouched({ title: true, body: true, authorUserId: true });
    
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setErrors({});
    await onSubmit({ title, body, authorUserId: Number(authorUserId) });
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const getCharCount = (text: string, max: number) => {
    const remaining = max - text.length;
    const isNearLimit = remaining <= max * 0.1;
    return { remaining, isNearLimit };
  };

  const titleCount = getCharCount(title, 100);
  const bodyCount = getCharCount(body, 5000);

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="space-y-2">
        <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Type className="h-4 w-4 text-muted-foreground" />
          Title
        </label>
        <div className="relative">
          <input
            id="title"
            className={`h-11 w-full rounded-lg border bg-background px-4 text-sm text-foreground outline-none ring-offset-background transition-all placeholder:text-muted-foreground focus:ring-2 ${
              touched.title && errors.title 
                ? 'border-destructive focus:ring-destructive/20' 
                : 'border-input focus:border-primary focus:ring-primary/20'
            }`}
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleBlur('title')}
            disabled={isSubmitting}
            maxLength={100}
          />
        </div>
        <div className="flex items-center justify-between">
          {touched.title && errors.title ? (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.title}
            </div>
          ) : (
            <span />
          )}
          <span className={`text-xs ${titleCount.isNearLimit ? 'text-warning' : 'text-muted-foreground'}`}>
            {title.length}/100
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="body" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Content
        </label>
        <div className="relative">
          <textarea
            id="body"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground outline-none ring-offset-background transition-all placeholder:text-muted-foreground focus:ring-2 ${
              touched.body && errors.body 
                ? 'border-destructive focus:ring-destructive/20' 
                : 'border-input focus:border-primary focus:ring-primary/20'
            }`}
            placeholder="Write your post content here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onBlur={() => handleBlur('body')}
            disabled={isSubmitting}
            rows={8}
            maxLength={5000}
          />
        </div>
        <div className="flex items-center justify-between">
          {touched.body && errors.body ? (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.body}
            </div>
          ) : (
            <span />
          )}
          <span className={`text-xs ${bodyCount.isNearLimit ? 'text-warning' : 'text-muted-foreground'}`}>
            {body.length}/5000
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="author" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <User className="h-4 w-4 text-muted-foreground" />
          Author
        </label>
        
        {usersQuery.isLoading ? (
          <div className="flex h-11 items-center gap-2 rounded-lg border border-input bg-muted px-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-11 items-center gap-2 rounded-lg border border-warning/20 bg-warning/10 px-4 text-sm text-warning">
            <AlertCircle className="h-4 w-4" />
            Import a user first before creating posts
          </div>
        ) : (
          <select
            id="author"
            className={`h-11 w-full rounded-lg border bg-background px-4 text-sm text-foreground outline-none ring-offset-background transition-all focus:ring-2 ${
              touched.authorUserId && errors.authorUserId 
                ? 'border-destructive focus:ring-destructive/20' 
                : 'border-input focus:border-primary focus:ring-primary/20'
            }`}
            value={authorUserId}
            onChange={(e) => setAuthorUserId(e.target.value)}
            onBlur={() => handleBlur('authorUserId')}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select an author</option>
            {users.map((u) => (
              <option key={u.id} value={String(u.id)}>
                {u.email}
              </option>
            ))}
          </select>
        )}
        
        {touched.authorUserId && errors.authorUserId && !usersQuery.isLoading && users.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            {errors.authorUserId}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={usersQuery.isLoading || users.length === 0 || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <span>{submitLabel}</span>
        )}
      </button>
    </form>
  );
}
