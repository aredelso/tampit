'use client';

import NextLink from 'next/link';
import { ReactNode } from 'react';

export function Link({
  href,
  path,
  label,
  activeLabel,
}: {
  href: string;
  path: string;
  label: ReactNode;
  activeLabel?: ReactNode;
}) {
  const isActive = path === href;

  return (
    <NextLink
      href={href}
      className="relative flex flex-col items-center px-3 py-1.5 text-sm font-medium transition-colors duration-150"
      style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      {isActive && activeLabel ? activeLabel : label}
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-150"
        style={{
          width: isActive ? '100%' : 0,
          height: '2px',
          background: 'var(--accent)',
        }}
      />
    </NextLink>
  );
}
