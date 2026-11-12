import { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    top: {
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    bottom: {
      top: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    left: {
      right: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    right: {
      left: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{ display: 'flex' }}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className="pointer-events-none absolute z-10"
          style={positionStyles[position]}
        >
          <div
            className="block rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg"
            style={{ background: 'var(--text-h)', color: 'var(--bg)' }}
          >
            {content}
          </div>
          <div
            className="block w-2 h-2 mx-auto -mt-1 rotate-45"
            style={{ background: 'var(--text-h)' }}
          />
        </div>
      )}
    </div>
  );
}
