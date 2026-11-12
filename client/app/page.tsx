'use client';

import { useState, useEffect } from 'react';
import { useEntries } from '@/hooks/useEntries';
import { EntryCard } from '@/components/EntryCard';
import type { EntryFormData } from '@/components/EntryForm';
import { SkeletonLoader } from '@/components/Spinner';
import { Button } from '@/components/Button';
import { SearchCombobox } from '@/components/SearchCombobox';
import { Tabs } from '@/components/Tabs';
import { useUser } from '@/context/UserContext';

export default function Page() {
  const { user, login } = useUser();
  const [query, setQuery] = useState('');
  const [feedType, setFeedType] = useState<'all' | 'following'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    entryFeed,
    mutateFeed,
    loadMore,
    hasMore,
    loadingFeed,
    seed,
    updateEntry,
    deleteEntry,
  } = useEntries({
    limit: 10,
    feedType: feedType === 'following' ? 'following' : undefined,
  });

  // Reset to 'all' feed if user logs out while on 'following' feed
  useEffect(() => {
    if (!user && feedType === 'following') {
      setFeedType('all');
    }
  }, [user]);

  async function handleSeed() {
    // The server logs in the dev user during seeding, so no credentials are needed here.
    const res = await seed();
    if (res) login(res.token, res.user);
  }

  async function handleEditEntry(
    entry: (typeof entryFeed)[0],
    data: EntryFormData
  ) {
    if (!user) return false;
    const ok = await updateEntry(entry.id, { ...data, userId: user.id });
    if (ok) {
      setEditingId(null);
      mutateFeed();
    }
    return ok;
  }

  return (
    <div className="space-y-10">
      <section className="mb-8">
        <div className="mb-6">
          <SearchCombobox value={query} onChange={setQuery} />
        </div>

        {user && (
          <Tabs
            tabs={[
              { key: 'all', label: 'All' },
              { key: 'following', label: 'Following' },
            ]}
            activeTab={feedType}
            onTabChange={setFeedType}
          />
        )}

        {loadingFeed && entryFeed.length === 0 ? (
          <div
            className="space-y-2"
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="card overflow-hidden p-4 sm:p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <SkeletonLoader
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="flex-1 space-y-2">
                    <SkeletonLoader width="40%" height={16} />
                    <SkeletonLoader width="25%" height={12} />
                  </div>
                </div>
                <SkeletonLoader width="100%" height={200} />
                <div className="space-y-2">
                  <SkeletonLoader width="60%" height={16} />
                  <SkeletonLoader width="80%" height={16} />
                </div>
              </div>
            ))}
          </div>
        ) : entryFeed.length > 0 ? (
          <>
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {entryFeed.map((e) => (
                <EntryCard
                  key={e.id}
                  entry={e}
                  onToggleFollow={mutateFeed}
                  isEditing={editingId === e.id}
                  onEdit={
                    user?.id === e.userId
                      ? (entry) => setEditingId(entry.id)
                      : undefined
                  }
                  onSave={
                    user?.id === e.userId
                      ? (data) => handleEditEntry(e, data)
                      : undefined
                  }
                  onCancel={
                    user?.id === e.userId ? () => setEditingId(null) : undefined
                  }
                  onDelete={user?.id === e.userId ? deleteEntry : undefined}
                />
              ))}
            </ul>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingFeed}
                className="mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-h)',
                  border: '1px solid var(--border)',
                }}
              >
                {loadingFeed ? 'Loading…' : 'Show More'}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No entries.
          </p>
        )}
      </section>

      {user && process.env.NODE_ENV === 'development' && (
        <Button onClick={handleSeed} variant="ghost">
          Seed test data
        </Button>
      )}
    </div>
  );
}
