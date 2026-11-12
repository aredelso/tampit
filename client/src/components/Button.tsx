'use client';

import React, { useState } from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-sm rounded-lg',
  icon: 'p-3 rounded-full',
};

const variantBaseStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--accent-fg)',
  },
  secondary: {
    background: 'var(--bg-card)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-muted)',
  },
  danger: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled = false,
      children,
      className = '',
      style: customStyle,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const isDisabled = disabled || loading;

    const baseClasses =
      'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-50 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClass = sizeStyles[size];
    const widthClass = fullWidth ? 'w-full' : '';

    const variantStyle = variantBaseStyles[variant];
    const baseStyle: React.CSSProperties = {
      cursor: isDisabled ? 'not-allowed' : 'pointer',
    };

    const hoverStyle: React.CSSProperties =
      variant === 'ghost' && isHovered
        ? { background: 'var(--bg-subtle)' }
        : {};

    const style: React.CSSProperties = {
      ...baseStyle,
      ...variantStyle,
      ...hoverStyle,
      ...customStyle,
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(true);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false);
      onMouseLeave?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseClasses} ${sizeClass} ${widthClass} ${className}`}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {loading && <Spinner size={14} color="currentColor" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
