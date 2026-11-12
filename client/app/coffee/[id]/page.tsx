'use client';

import { use, useMemo, useState, useOptimistic, useTransition } from 'react';
import useSWR from 'swr';
import type { Coffee } from '@shared/coffee';
import { api } from '@/lib/api';
import { useCoffeeEntries, useEntries } from '@/hooks/useEntries';
import { useUser } from '@/context/UserContext';
import { useWishlist, type WishlistItem } from '@/hooks/useWishlist';
import { EntryCard } from '@/components/EntryCard';
import { EntryForm, type EntryFormData } from '@/components/EntryForm';
import { InventoryModal } from '@/components/InventoryModal';
import { Tabs } from '@/components/Tabs';
import { Button } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';
import NextLink from 'next/link';
import { StarRating } from '@/components/StarRating';
import { Avatar } from '@/components/Avatar';
import { PageHeader } from '@/components/PageHeader';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import StorageIcon from '@mui/icons-material/Storage';
import { useInventory } from '@/hooks/useInventory';

type Tab = 'all' | 'mine';

export default function CoffeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const coffeeId = Number(id);
  const { user } = useUser();
  const { addEntry } = useEntries();
  const { wishlist, add, remove } = useWishlist();
  const { add: addToInventory } = useInventory();
  const [tab, setTab] = useState<Tab>('all');
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  const { data: coffee } = useSWR<Coffee>(`/coffees/${id}`, () =>
    api.coffees.findOne(coffeeId)
  );
  const { entries, isLoading: entriesLoading } = useCoffeeEntries(coffeeId);

  const isWishlisted = wishlist.some(
    (item: WishlistItem) => item.coffeeId === coffeeId
  );
  const [optimisticIsWishlisted, setOptimisticIsWishlisted] = useOptimistic(
    isWishlisted,
    (_, newValue: boolean) => newValue
  );

  const myEntries = useMemo(
    () => entries.filter((e) => e.userId === user?.id),
    [entries, user]
  );

  const visibleEntries = tab === 'mine' ? myEntries : entries;

  const handleAddEntry = async (data: EntryFormData): Promise<boolean> => {
    const ok = await addEntry({ ...data, userId: user!.id });
    if (ok) {
      setEntryFormOpen(false);
    }
    return ok;
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const newWishlistStatus = !isWishlisted;
    startTransition(() => {
      setOptimisticIsWishlisted(newWishlistStatus);
    });

    setIsLoading(true);
    try {
      if (isWishlisted) {
        await remove(coffeeId);
      } else {
        await add(coffeeId);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      setOptimisticIsWishlisted(isWishlisted);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitInventory = async (roastDate?: Date) => {
    try {
      await addToInventory({
        coffeeId,
        roastDate: roastDate ? roastDate.toISOString() : undefined,
      });
      setInventoryModalOpen(false);
    } catch (error) {
      console.error('Failed to add to inventory:', error);
    }
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All check-ins', count: entries.length },
    { key: 'mine', label: 'Mine', count: myEntries.length },
  ];

  return (
    <div className="space-y-2">
      <PageHeader
        avatar={
          <div
            className="rounded-xl overflow-hidden"
            style={{ width: 64, height: 64, background: 'var(--accent)' }}
          >
            <Avatar
              src={coffee?.photoUrl ?? coffee?.roaster.logoUrl}
              name={coffee?.name}
              size={64}
            />
          </div>
        }
        title={coffee?.name ?? '…'}
        meta={
          <>
            {(coffee?.origin ||
              coffee?.variety ||
              coffee?.farm ||
              coffee?.process) && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {coffee.origin ? (
                  <NextLink
                    href={`/origin/${encodeURIComponent(coffee.origin)}`}
                    className="hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {coffee.origin}
                  </NextLink>
                ) : null}
                {coffee.origin &&
                  (coffee.variety || coffee.farm || coffee.process) &&
                  ' · '}
                {coffee.variety && <span>{coffee.variety}</span>}
                {coffee.variety && (coffee.farm || coffee.process) && ' · '}
                {coffee.farm && <span>{coffee.farm}</span>}
                {coffee.farm && coffee.process && ' · '}
                {coffee.process ?? null}
              </p>
            )}
            {coffee && (
              <NextLink
                href={`/roaster/${coffee.roaster.id}`}
                className="text-sm hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                {coffee.roaster.name}
              </NextLink>
            )}
          </>
        }
        right={
          <>
            {coffee?.avgRating != null && (
              <div className="flex items-center gap-1">
                <StarRating
                  value={Math.round(coffee.avgRating * 2) / 2}
                  size={16}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-h)' }}
                >
                  {coffee.avgRating.toFixed(1)}
                </span>
              </div>
            )}
            {coffee?.entryCount ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {coffee.entryCount}{' '}
                {coffee.entryCount === 1 ? 'check-in' : 'check-ins'}
              </p>
            ) : undefined}
          </>
        }
        bottom={
          <>
            {coffee?.description ? (
              <p className="text-sm mt-1">{coffee.description}</p>
            ) : undefined}
            {user && (
              <div className="flex gap-2 mt-1">
                <Tooltip content="Check in">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setEntryFormOpen(true)}
                  >
                    <LocalCafeIcon sx={{ fontSize: 18 }} />
                  </Button>
                </Tooltip>
                <Tooltip content="Add to inventory">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setInventoryModalOpen(true)}
                  >
                    <StorageIcon sx={{ fontSize: 18 }} />
                  </Button>
                </Tooltip>
                <Tooltip
                  content={
                    optimisticIsWishlisted
                      ? 'Remove from wishlist'
                      : 'Add to wishlist'
                  }
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    style={{
                      color: optimisticIsWishlisted
                        ? 'var(--accent)'
                        : 'var(--text-muted)',
                    }}
                    onClick={handleWishlistToggle}
                  >
                    {optimisticIsWishlisted ? (
                      <BookmarkIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <BookmarkBorderIcon sx={{ fontSize: 18 }} />
                    )}
                  </Button>
                </Tooltip>
              </div>
            )}
          </>
        }
      />

      {user && <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} />}

      <div className="pt-2">
        {entriesLoading ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading…
          </p>
        ) : visibleEntries.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {tab === 'mine' ? 'No check-ins from you yet.' : 'No entries yet.'}
          </p>
        ) : (
          <ul
            className="space-y-2"
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
          >
            {visibleEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>

      {entryFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
          <div
            className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <EntryForm
              coffeeId={coffeeId}
              onSubmit={handleAddEntry}
              onCancel={() => setEntryFormOpen(false)}
              submitLabel="Add Entry"
            />
          </div>
        </div>
      )}

      {inventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
          <div
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <InventoryModal
              onSubmit={handleSubmitInventory}
              onCancel={() => setInventoryModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
