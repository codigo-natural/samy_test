'use client';

import { 
  LogIn, 
  LogOut, 
  UserPlus, 
  UserMinus, 
  FilePlus, 
  FileEdit, 
  FileMinus, 
  AlertCircle,
  Activity,
  Clock
} from 'lucide-react';
import { useActivityStore, ActivityEvent } from '@/lib/store/activity.store';

const iconMap: Record<string, typeof LogIn> = {
  'auth.login': LogIn,
  'auth.login_failed': AlertCircle,
  'auth.logout': LogOut,
  'user.import': UserPlus,
  'user.delete': UserMinus,
  'post.create': FilePlus,
  'post.update': FileEdit,
  'post.delete': FileMinus,
};

const colorMap: Record<string, string> = {
  'auth.login': 'text-success bg-success/10 border-success/20',
  'auth.login_failed': 'text-destructive bg-destructive/10 border-destructive/20',
  'auth.logout': 'text-muted-foreground bg-muted border-border',
  'user.import': 'text-info bg-info/10 border-info/20',
  'user.delete': 'text-warning bg-warning/10 border-warning/20',
  'post.create': 'text-success bg-success/10 border-success/20',
  'post.update': 'text-info bg-info/10 border-info/20',
  'post.delete': 'text-destructive bg-destructive/10 border-destructive/20',
};

function ActivityItem({ event, index }: { event: ActivityEvent; index: number }) {
  const Icon = iconMap[event.type] || Activity;
  const colorClass = colorMap[event.type] || 'text-muted-foreground bg-muted border-border';
  
  return (
    <div 
      className="group flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border hover:bg-card hover:shadow-sm"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground line-clamp-2">
          {event.message}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <time dateTime={new Date(event.timestamp).toISOString()}>
            {new Date(event.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const events = useActivityStore((s) => s.events);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Activity Feed</h3>
            <p className="text-xs text-muted-foreground">Recent actions</p>
          </div>
        </div>
        {events.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {events.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[calc(100vh-20rem)] overflow-y-auto p-3">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">No activity yet</p>
            <p className="mt-1 max-w-50 text-xs text-muted-foreground">
              Actions like logins, imports, and posts will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event, idx) => (
              <ActivityItem key={`${event.timestamp}-${idx}`} event={event} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
