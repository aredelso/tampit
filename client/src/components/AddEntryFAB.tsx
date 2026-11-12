'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';
import { mutate } from 'swr';
import { EntryForm, type EntryFormData } from './EntryForm';
import { CoffeeForm, type CoffeeFormData } from './CoffeeForm';
import { RecipeForm, type RecipeFormData } from './RecipeForm';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CoffeeIcon from '@mui/icons-material/Coffee';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';

type Mode = 'closed' | 'menu' | 'entry' | 'coffee' | 'recipe';

export function AddEntryFAB() {
  const { user } = useUser();
  const [mode, setMode] = useState<Mode>('closed');
  const pathname = usePathname();
  const roasterMatch = pathname.match(/^\/roaster\/(\d+)/);
  const contextRoasterId = roasterMatch ? Number(roasterMatch[1]) : undefined;

  const addEntry = useCallback(async (payload: any) => {
    try {
      await api.entries.create(payload);
      await mutate('/entries');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (mode === 'closed') return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMode('closed');
    }
    function onPointerDown(e: PointerEvent) {
      if (mode === 'menu' && !(e.target as Element).closest('[data-fab]')) {
        setMode('closed');
      }
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [mode]);

  if (!user) return null;

  async function handleAddEntry(data: EntryFormData): Promise<boolean> {
    const ok = await addEntry({ ...data, userId: user!.id });
    if (ok) setMode('closed');
    return ok;
  }

  async function handleAddCoffee(data: CoffeeFormData): Promise<boolean> {
    try {
      await api.coffees.create({
        roasterId: data.roasterId,
        name: data.name,
        origin: data.origin || undefined,
        process: data.process || undefined,
        description: data.description || undefined,
        photoUrl: data.photoUrl || undefined,
      });
      await mutate(
        (key: unknown) => typeof key === 'string' && key.startsWith('/coffees'),
        undefined,
        { revalidate: true }
      );
      setMode('closed');
      return true;
    } catch {
      return false;
    }
  }

  async function handleAddRecipe(data: RecipeFormData): Promise<boolean> {
    try {
      await api.recipes.create(data);
      await mutate(
        (key: unknown) => typeof key === 'string' && key.startsWith('/recipes'),
        undefined,
        { revalidate: true }
      );
      setMode('closed');
      return true;
    } catch {
      return false;
    }
  }

  const isOpen = mode !== 'closed';

  return (
    <>
      <div
        data-fab
        className="fixed bottom-8 right-20 z-40 flex flex-col items-end gap-3"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="flex flex-col items-end gap-2 transition-all duration-200"
          style={{
            opacity: mode === 'menu' ? 1 : 0,
            transform: mode === 'menu' ? 'translateY(0)' : 'translateY(8px)',
            pointerEvents: mode === 'menu' ? 'auto' : 'none',
          }}
        >
          <button
            onClick={() => setMode('entry')}
            className="flex items-center gap-2 rounded-full px-4 py-2 shadow-lg text-sm font-medium transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
            }}
          >
            Add Entry
            <NoteAddIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />
          </button>
          <button
            onClick={() => setMode('coffee')}
            className="flex items-center gap-2 rounded-full px-4 py-2 shadow-lg text-sm font-medium transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
            }}
          >
            Add Coffee
            <CoffeeIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />
          </button>
          <button
            onClick={() => setMode('recipe')}
            className="flex items-center gap-2 rounded-full px-4 py-2 shadow-lg text-sm font-medium transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
            }}
          >
            Add Recipe
            <MenuBookIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />
          </button>
        </div>

        {/* FAB */}
        <button
          onClick={() => setMode((m) => (m === 'menu' ? 'closed' : 'menu'))}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-fg)',
            pointerEvents: 'auto',
          }}
          aria-label="Open actions"
        >
          <AddIcon
            sx={{
              fontSize: 26,
              transform: isOpen ? 'rotate(45deg)' : 'none',
              transition: 'transform 200ms',
            }}
          />
        </button>
      </div>

      {(mode === 'entry' || mode === 'coffee' || mode === 'recipe') && (
        <div
          className="fixed inset-0 z-30"
          style={{
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setMode('closed')}
        />
      )}

      {(mode === 'entry' || mode === 'coffee' || mode === 'recipe') && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
          <div
            className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {mode === 'entry' && (
              <EntryForm
                onSubmit={handleAddEntry}
                onCancel={() => setMode('closed')}
                submitLabel="Add Entry"
              />
            )}
            {mode === 'coffee' && (
              <CoffeeForm
                roasterId={contextRoasterId}
                onSubmit={handleAddCoffee}
                onCancel={() => setMode('closed')}
                submitLabel="Add Coffee"
              />
            )}
            {mode === 'recipe' && (
              <RecipeForm
                onSubmit={handleAddRecipe}
                onCancel={() => setMode('closed')}
                submitLabel="Create Recipe"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
