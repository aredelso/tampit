import { ReactNode } from 'react';
import { Skeleton } from './Skeleton';

export function PageHeader({
  avatar,
  title,
  meta,
  right,
  bottom,
  children,
  loading,
}: {
  avatar?: ReactNode;
  title: string;
  meta?: ReactNode;
  right?: ReactNode;
  bottom?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="mb-4">
        <div className="flex items-start gap-4">
          <Skeleton
            width="w-16"
            height="h-16"
            className="rounded-full shrink-0"
          />
          <div className="flex-1 space-y-2">
            <Skeleton height="h-6" width="w-48" />
            <Skeleton height="h-4" width="w-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-start gap-4">
        {avatar && <div className="shrink-0">{avatar}</div>}
        <div className="flex-1 min-w-0">
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--text-h)' }}
          >
            {title}
          </h1>
          {meta && (
            <div className="mt-1" style={{ color: 'var(--text-muted)' }}>
              {meta}
            </div>
          )}
          {children}
        </div>
        {right && (
          <div className="flex flex-col items-end gap-1 shrink-0">{right}</div>
        )}
      </div>
      {bottom && <div className="mt-4">{bottom}</div>}
    </div>
  );
}
