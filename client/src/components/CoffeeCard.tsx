'use client';

import type { Coffee } from '@shared/coffee';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { StarRating } from './StarRating';
import NextLink from 'next/link';
import { useWishlist, type WishlistItem } from '@/hooks/useWishlist';
import { useState, useOptimistic, useTransition, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import StorageIcon from '@mui/icons-material/Storage';
import { EntryForm, EntryFormData } from './EntryForm';
import { InventoryModal } from './InventoryModal';
import { useUser } from '@/context/UserContext';
import { useCoffees } from '@/hooks/useCoffees';
import { useEntries } from '@/hooks/useEntries';
import { useInventory } from '@/hooks/useInventory';

export function CoffeeCard({
  coffee,
  onEntryAdded,
}: {
  coffee: Coffee;
  onEntryAdded?: () => void;
}) {
  const { user } = useUser();
  const { addEntry } = useEntries();
  const { wishlist, add: addToWishlist, remove } = useWishlist();
  const { add: addToInventory } = useInventory();
  const [isLoading, setIsLoading] = useState(false);
  const [entryFormOpen, setEntryFormOpen] = useState<number | null>(null);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  const isWishlisted = wishlist.some(
    (item: WishlistItem) => item.coffeeId === coffee.id
  );
  const [optimisticIsWishlisted, setOptimisticIsWishlisted] = useOptimistic(
    isWishlisted,
    (_, newValue: boolean) => newValue
  );

  const meta = [coffee?.origin, coffee?.variety, coffee?.farm, coffee?.process]
    .filter(Boolean)
    .join(' · ');

  const handleOpenEntryForm = (coffeeId: number) => {
    setEntryFormOpen(coffeeId);
  };

  async function handleAddEntry(data: EntryFormData): Promise<boolean> {
    const ok = await addEntry({ ...data, userId: user!.id });
    if (ok) {
      setEntryFormOpen(null);
      onEntryAdded?.();
    }
    return ok;
  }

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
        await remove(coffee.id);
      } else {
        await addToWishlist(coffee.id);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      setOptimisticIsWishlisted(isWishlisted);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToInventory = (id: number) => {
    setInventoryModalOpen(true);
  };

  const handleSubmitInventory = async (roastDate?: Date) => {
    try {
      await addToInventory({
        coffeeId: coffee.id,
        roastDate: roastDate ? roastDate.toISOString() : undefined,
      });
      setInventoryModalOpen(false);
    } catch (error) {
      console.error('Failed to add to inventory:', error);
    }
  };

  return (
    <div className="card overflow-hidden flex flex-col">
      <NextLink href={`/coffee/${coffee.id}`} className="block flex-1">
        <div className="flex items-start gap-4 px-4 sm:px-6 py-4">
          <div
            className="relative flex items-center justify-center rounded-sm shrink-0 overflow-hidden"
            style={{
              width: 48,
              height: 48,
              background: 'var(--accent)',
            }}
          >
            <Avatar
              src={coffee.photoUrl ?? coffee.roaster.logoUrl}
              name={coffee.name}
              size={48}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-h)' }}
                >
                  {coffee.name}
                </p>
                <p
                  className="text-sm mt-0.5 truncate"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {coffee.roaster.name}
                </p>
                {meta && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {meta}
                  </p>
                )}
              </div>
              {(coffee.avgRating != null || coffee.entryCount != null) && (
                <div className="flex flex-col items-end gap-1">
                  {coffee.avgRating != null && (
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
                  {coffee.entryCount != null && (
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {coffee.entryCount}{' '}
                      {coffee.entryCount === 1 ? 'check-in' : 'check-ins'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {coffee?.description && (
              <p
                className="text-sm mt-3"
                style={{ color: 'var(--text-muted)' }}
              >
                {coffee.description}
              </p>
            )}
          </div>
        </div>
      </NextLink>
      <div
        className="flex text-xs px-4 pb-4 gap-4"
        style={{
          color: 'var(--text-muted)',
        }}
      >
        <Tooltip content="Check in">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full group"
            onClick={() => handleOpenEntryForm(coffee.id)}
          >
            <LocalCafeIcon
              sx={{
                fontSize: 14,
                transition: 'transform 0.6s ease',
              }}
              className="group-hover:rotate-16"
            />
          </Button>
        </Tooltip>
        <Tooltip content="Add to inventory">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full group"
            onClick={() => handleAddToInventory(coffee.id)}
          >
            <StorageIcon
              sx={{
                fontSize: 14,
              }}
            />
          </Button>
        </Tooltip>
        <Tooltip
          content={
            optimisticIsWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
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
              <BookmarkIcon sx={{ fontSize: 14 }} />
            ) : (
              <BookmarkBorderIcon sx={{ fontSize: 14 }} />
            )}
          </Button>
        </Tooltip>
      </div>

      {entryFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
          <div
            className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <EntryForm
              coffeeId={entryFormOpen}
              onSubmit={handleAddEntry}
              onCancel={() => setEntryFormOpen(null)}
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
