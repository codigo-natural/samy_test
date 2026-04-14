"use client";

import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { getSavedUsers } from '@/lib/api/users';
import { getPosts } from '@/lib/api/posts';
import { useAuthStore } from '@/lib/store/auth.store';
import { ArrowRight } from "lucide-react";

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PostIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function DashboardPage() {
  const { email, role } = useAuthStore();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-dashboard'],
    queryFn: () => getSavedUsers(1, 100),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['posts-dashboard'],
    queryFn: () => getPosts(1, 100),
  });

  const userCount = usersData?.total ?? 0;
  const postCount = postsData?.total ?? 0;
  const userItems = usersData?.data ?? [];
  const postItems = postsData?.data ?? [];

  const displayName = email ? email.split('@')[0] : 'Guest';

  const StatCard = ({
    label,
    value,
    subtitle,
  }: {
    label: string;
    value: string | number;
    subtitle: string;
  }) => (
    <div className="col-span-1 row-span-1 bg-surface border border-border rounded-lg p-5 flex flex-col justify-between relative overflow-hidden group hover:border-muted-foreground/20 transition-colors duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
      <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-col">
        <span className="text-3xl font-mono text-foreground tracking-tighter tabular-nums">
          {value}
        </span>
        <span className="text-[11px] text-muted-foreground mt-1">{subtitle}</span>
      </div>
    </div>
  );

  const ActionCard = ({
    label,
    subtitle,
    accent = false,
    link,
  }: {
    label: string;
    subtitle: string;
    accent?: boolean;
    link?: string;
  }) => (

    <Link href={`${link}`}
      className={`col-span-1 row-span-1 bg-surface border rounded-lg p-5 flex flex-col justify-between text-left relative overflow-hidden group transition-all duration-300 ${accent
        ? "border-primary/20 hover:border-primary/40 hover:bg-surface-hover"
        : "border-border hover:border-muted-foreground/20 hover:bg-surface-hover"
        }`}>
      <div
        className={`absolute inset-0 bg-linear-to-br from-foreground/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
      />
      <span
        className={`text-[10px] uppercase tracking-[0.15em] font-medium relative z-10 ${accent ? "text-primary/60" : "text-muted-foreground"
          }`}
      >
        Quick Action
      </span>
      <div className="flex items-end justify-between relative z-10">
        <div className="flex flex-col">
          <span className="text-foreground font-medium text-sm">{label}</span>
          <span className="text-[11px] text-muted-foreground mt-1">{subtitle}</span>
        </div>
        <ArrowRight
          className={`w-4 h-4 transition-colors ${accent
            ? "text-muted-foreground group-hover:text-primary"
            : "text-muted-foreground group-hover:text-foreground"
            }`}
        />
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 flex items-center justify-center">
      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 auto-rows-[160px] gap-4">
        {/* Header */}
        <header className="col-span-full flex items-end justify-between pb-6 border-b border-border mb-2 row-span-1 min-h-0 h-auto">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-medium tracking-tight">
              Welcome back, <span className="text-primary">{displayName}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Here's what's happening with your portal today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {role && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${role === 'ADMIN' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' :
                role === 'EDITOR' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                  'border-slate-500/30 bg-slate-500/10 text-slate-400'
                }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {role}
              </span>
            )}
          </div>

        </header>

        <StatCard label="Total Users" value={userCount} subtitle="Imported from ReqRes" />
        <StatCard label="Total Posts" value={postCount} subtitle="Created in portal" />

        <div className="col-span-1 md:col-span-2 row-span-2 bg-surface border border-border rounded-lg flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
          <div className="p-5 border-b border-border/50 flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
              Recent Activity
            </span>
            {(userItems.length > 0 || postItems.length > 0) && (
              <span className="text-[10px] text-muted-foreground">{userItems.slice(0, 3).length + postItems.slice(0, 2).length} items</span>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            {userItems.length === 0 && postItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Sparkles className="w-5 h-5 text-muted-foreground/50" />
                <span className="text-sm">No recent activity</span>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {userItems.slice(0, 3).map((user) => (
                  <div key={`user-${user.id}`} className="flex items-center justify-between border-b border-border/50 px-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-500">
                        <UserIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                        <p className="text-[11px] text-muted-foreground">{user.firstName} {user.lastName}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] shrink-0 ${user.role === 'ADMIN' ? 'text-cyan-400' :
                      user.role === 'EDITOR' ? 'text-amber-400' :
                        'text-slate-400'
                      }`}>{user.role}</span>
                  </div>
                ))}
                {postItems.slice(0, 2).map((post) => (
                  <div key={`post-${post.id}`} className="flex items-center justify-between border-b border-border/50 px-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                        <PostIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                        <p className="text-[11px] text-muted-foreground">By User #{post.authorUserId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ActionCard label="Import User" subtitle="Add from ReqRes" link="/users" />
        <ActionCard label="Create Post" subtitle="Write a new post" accent link="/posts" />
      </main>
    </div>
  );
}
