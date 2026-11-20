import type { ReactNode } from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="container-page py-12" role="status" aria-label="Loading">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-4 h-5 w-96 max-w-full" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-3xl" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Placeholder for a message that hasn't "arrived" yet. */
export function MessageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pt-2" role="status" aria-label="Incoming message">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="mt-4 h-24 w-5/6 rounded-3xl" />
      <Skeleton className="h-14 w-2/3 rounded-3xl" />
    </div>
  );
}

export function EmptyState({ emoji, title, children, action }: { emoji: string; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="card mx-auto flex max-w-lg flex-col items-center px-6 py-10 text-center">
      <span aria-hidden className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-soft text-4xl">
        {emoji}
      </span>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-2 text-muted">{children}</div>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
