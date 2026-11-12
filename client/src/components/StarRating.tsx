'use client';

import { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

function starFill(index: number, value: number): 'full' | 'half' | 'empty' {
  if (value >= index + 1) return 'full';
  if (value >= index + 0.5) return 'half';
  return 'empty';
}

export function StarRating({
  value,
  onChange,
  size = 24,
}: {
  value?: number | null;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;

  if (!onChange) {
    if (!value) return null;
    return (
      <div
        className="flex items-center"
        style={{ color: 'var(--accent)', gap: 1 }}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = starFill(i, value);
          return (
            <div key={i} style={{ display: 'flex' }}>
              {fill === 'full' ? (
                <StarIcon sx={{ fontSize: size }} />
              ) : fill === 'half' ? (
                <StarHalfIcon sx={{ fontSize: size }} />
              ) : (
                <StarBorderIcon sx={{ fontSize: size }} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="flex items-center"
      style={{ color: 'var(--accent)', gap: 1 }}
      onMouseLeave={() => setHovered(null)}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = starFill(i, display);
        return (
          <div
            key={i}
            className="cursor-pointer select-none"
            style={{ display: 'flex' }}
            onMouseMove={(e) => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              setHovered(e.clientX - left < width / 2 ? i + 0.5 : i + 1);
            }}
            onClick={(e) => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              onChange(e.clientX - left < width / 2 ? i + 0.5 : i + 1);
            }}
          >
            {fill === 'full' ? (
              <StarIcon sx={{ fontSize: size }} />
            ) : fill === 'half' ? (
              <StarHalfIcon sx={{ fontSize: size }} />
            ) : (
              <StarBorderIcon sx={{ fontSize: size }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
