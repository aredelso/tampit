'use client';

export function Skeleton({
  className = '',
  height = 'h-4',
  width = 'w-full',
  ...props
}: {
  className?: string;
  height?: string;
  width?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={`${width} ${height} rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-4">
      <div className="flex gap-4">
        <Skeleton width="w-12" height="h-12" className="rounded-sm shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton height="h-4" width="w-3/4" />
          <Skeleton height="h-3" width="w-1/2" />
        </div>
      </div>
      <Skeleton height="h-3" width="w-full" />
    </div>
  );
}

export function SkeletonPageHeader() {
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
