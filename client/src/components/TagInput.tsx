'use client';

import { useRef, useState } from 'react';
import { useTags } from '@/hooks/useTags';

export function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tags: dbTags } = useTags();

  const suggestions = dbTags.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !value.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (value.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setInput('');
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (input.trim()) {
        e.preventDefault();
        addTag(input);
        setOpen(false);
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-1.5 p-2 rounded-lg border cursor-text min-h-[42px]"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, i) => (
          <span key={i} className="tag-pill">
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              className="leading-none opacity-60 hover:opacity-100 transition-opacity"
              style={{ fontSize: 14 }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 100);
          }}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? 'e.g. blueberry, chocolate…' : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
          style={{ color: 'var(--text-h)' }}
          autoComplete="off"
        />
      </div>
      {open && input.length > 0 && suggestions.length > 0 && (
        <ul className="dropdown">
          {suggestions.slice(0, 8).map((s) => (
            <li
              key={s}
              className="dropdown-item"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(s);
                setOpen(false);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
