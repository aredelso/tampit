'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import type { Roaster } from '@shared/roaster';
import type { Coffee } from '@shared/coffee';
import { api } from '@/lib/api';
import { Avatar } from './Avatar';

type RoasterResult = {
  type: 'roaster';
  id: number;
  name: string;
  location?: string | null;
  logoUrl?: string | null;
};

type CoffeeResult = {
  type: 'coffee';
  id: number;
  name: string;
  roasterName?: string;
  roasterLogoUrl?: string | null;
};

type SearchResult = RoasterResult | CoffeeResult;

const MAX = 10;

export function SearchCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { data: roasters = [] } = useSWR<Roaster[]>('/roasters', () =>
    api.roasters.list()
  );
  const { data: coffees = [] } = useSWR<Coffee[]>('/coffees', () =>
    api.coffees.list()
  );

  const q = value.trim().toLowerCase();

  const results: SearchResult[] = q
    ? [
        ...roasters
          .filter((r) => r.name.toLowerCase().includes(q))
          .map(
            (r): RoasterResult => ({
              type: 'roaster',
              id: r.id,
              name: r.name,
              location: r.location,
              logoUrl: r.logoUrl,
            })
          ),
        ...coffees
          .filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              (c.roaster.name ?? '').toLowerCase().includes(q)
          )
          .map(
            (c): CoffeeResult => ({
              type: 'coffee',
              id: c.id,
              name: c.name,
              roasterName: c.roaster.name,
              roasterLogoUrl: c.roaster.logoUrl,
            })
          ),
      ]
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, MAX)
    : [];

  const showDropdown = open && results.length > 0;

  function navigate(href: string) {
    onChange('');
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const r = results[activeIndex];
      navigate(r.type === 'roaster' ? `/roaster/${r.id}` : `/coffee/${r.id}`);
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search by roaster or coffee…"
        className="input"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            setOpen(false);
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          ✕
        </button>
      )}

      {showDropdown && (
        <div ref={dropdownRef} className="dropdown" style={{ zIndex: 20 }}>
          {results.map((r, i) => (
            <button
              key={`${r.type}-${r.id}`}
              className="dropdown-item flex items-center gap-2 w-full text-left"
              style={
                activeIndex === i
                  ? { background: 'var(--bg-subtle)' }
                  : undefined
              }
              onMouseDown={(e) => {
                e.preventDefault();
                navigate(
                  r.type === 'roaster' ? `/roaster/${r.id}` : `/coffee/${r.id}`
                );
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <Avatar
                src={r.type === 'roaster' ? r.logoUrl : r.roasterLogoUrl}
                name={r.name}
                size={20}
              />
              <span className="truncate">{r.name}</span>
              <span
                className="text-xs ml-auto shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {r.type === 'roaster' ? r.location : r.roasterName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
