'use client';

import type { Coffee } from '@shared/coffee';
import { Avatar } from './Avatar';
import { Button } from './Button';
import NextLink from 'next/link';
import { ConfirmationModal } from './ConfirmationModal';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useInventory } from '@/hooks/useInventory';
import { useState, useRef, useEffect } from 'react';
import { InventoryModal } from './InventoryModal';

export function CoffeeInventoryCard({
  id,
  coffee,
}: {
  id: number;
  coffee: Coffee;
}) {
  const { remove, add, update } = useInventory();
  const meta = [coffee?.origin, coffee?.process].filter(Boolean).join(' · ');
  const [modalOpen, setModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [inventoryModal, setInventoryModal] = useState<
    'edit' | 'duplicate' | null
  >(null);

  useEffect(() => {
    if (!showMenu) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showMenu]);

  const handleRemoveFromInventory = () => {
    setShowMenu(false);
    setModalOpen(true);
  };

  const handleSubmitInventory = async (roastDate?: Date) => {
    try {
      inventoryModal === 'edit'
        ? await update(coffee.id, { roastDate })
        : await add({ coffeeId: coffee.id, roastDate });
    } catch (error) {
      console.error(`Failed to ${inventoryModal} inventory item:`, error);
    }
  };

  const handleRemoveInventory = async () => {
    try {
      await remove(id);
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to remove from inventory:', error);
    }
  };

  return (
    <div
      className="card flex flex-col relative"
      style={{ overflow: showMenu ? 'visible' : 'hidden' }}
    >
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
              src={coffee?.photoUrl ?? coffee.roaster.logoUrl}
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
            </div>
          </div>
        </div>
      </NextLink>
      <div ref={menuRef} className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMenu((v) => !v)}
          aria-label="More options"
        >
          <MoreVertIcon sx={{ fontSize: 18 }} />
        </Button>
        {showMenu && (
          <div
            className="absolute right-0 top-full mt-1 rounded-lg shadow-lg py-1 min-w-[140px]"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <button
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--text-h)' }}
              onClick={() => {
                setInventoryModal('edit');
                setShowMenu(false);
              }}
            >
              Edit
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--text-h)' }}
              onClick={() => {
                setInventoryModal('duplicate');
                setShowMenu(false);
              }}
            >
              Duplicate
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--error, #e11d48)' }}
              onClick={() => {
                handleRemoveFromInventory();
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={modalOpen}
        title="Remove from Inventory?"
        message={
          <>
            Are you sure you want to remove <strong>{coffee.name}</strong> from
            your inventory?
          </>
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleRemoveInventory}
        onCancel={() => setModalOpen(false)}
      />

      {inventoryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
          <div
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <InventoryModal
              mode={inventoryModal}
              onSubmit={handleSubmitInventory}
              onCancel={() => setInventoryModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
