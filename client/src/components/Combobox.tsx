'use client';

import { useEffect, useRef, useState } from 'react';

export type ComboboxOption = {
  label: string;
  sublabel?: string;
  data?: unknown;
};

export function Combobox({
  value,
  onChange,
  onSelect,
  onConfirm,
  options,
  placeholder,
  required,
  autoFocus,
  minChars = 0,
  addLabel,
  onAdd,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (opt: ComboboxOption) => void;
  onConfirm?: () => void;
  options: ComboboxOption[];
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  minChars?: number;
  addLabel?: string;
  onAdd?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const meetsMin = value.length >= minChars;
  const showAdd =
    value.length > 0 &&
    !!addLabel &&
    meetsMin &&
    !options.some((opt) => opt.label === value);
  const showOptions = options.length > 0 && meetsMin;

  return (
    <div ref={ref} className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          if (value.trim()) onConfirm?.();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
          if (e.key === 'Enter' && value.trim()) {
            e.preventDefault();
            setOpen(false);
            onConfirm?.();
          }
        }}
        placeholder={placeholder}
        className="input"
        required={required}
        autoComplete="off"
      />
      {open && (showAdd || showOptions) && (
        <ul className="dropdown">
          {showAdd && (
            <li
              className="dropdown-item"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                onAdd?.();
              }}
            >
              {addLabel}
              {` "${value}"`}
            </li>
          )}
          {showOptions &&
            options.map((opt, i) => (
              <li
                key={opt.label + i}
                className="dropdown-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.label);
                  setOpen(false);
                  onSelect?.(opt);
                  onConfirm?.();
                }}
              >
                <span>{opt.label}</span>
                {opt.sublabel && (
                  <span
                    style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}
                  >
                    {' '}
                    — {opt.sublabel}
                  </span>
                )}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
