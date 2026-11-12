'use client';

import { useEffect, useState, useMemo } from 'react';

const imageCache = new Map<string, boolean>();

export function Avatar({
  src,
  name,
  size = 32,
  rounded = false,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  rounded?: boolean;
}) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const initials = useMemo(
    () => name?.trim().charAt(0).toUpperCase() ?? '?',
    [name]
  );
  const px = `${size}px`;
  const shape = rounded ? 'rounded-full' : 'rounded-sm';

  useEffect(() => {
    if (!src) {
      setResolvedSrc(null);
      return;
    }

    if (imageCache.has(src)) {
      setResolvedSrc(src);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(src, true);
      setResolvedSrc(src);
    };
    img.onerror = () => {
      imageCache.set(src, false);
      setResolvedSrc(null);
    };
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={name ?? ''}
        className={`${shape} object-cover shrink-0`}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <span
      className={`${shape} inline-flex items-center justify-center font-semibold shrink-0 select-none`}
      style={{
        width: px,
        height: px,
        fontSize: size * 0.4,
        background: 'var(--bg-card)',
        color: 'var(--accent-fg)',
      }}
    >
      {initials}
    </span>
  );
}
