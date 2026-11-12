import { CSSProperties } from 'react';

export function Spinner({
  size = 16,
  color = 'currentColor',
  className = '',
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const spinnerStyle: CSSProperties = {
    width: size,
    height: size,
    border: `2px solid ${color}`,
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className={className} style={spinnerStyle} />
    </>
  );
}

export function SkeletonLoader({
  width = '100%',
  height = '20px',
  className = '',
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{
        width,
        height,
        background: 'var(--bg-subtle)',
      }}
    />
  );
}
