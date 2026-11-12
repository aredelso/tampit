'use client';

import { useEffect, useState, Suspense } from 'react';
import type { Entry } from '@shared/entry';
import { useEntries, useUserEntries } from '@/hooks/useEntries';
import { useRecipes } from '@/hooks/useRecipes';
import { EntryForm, type EntryFormData } from '@/components/EntryForm';
import { EntryCard } from '@/components/EntryCard';
import { RecipeCard } from '@/components/RecipeCard';
import type { RecipeFormData } from '@/components/RecipeForm';
import { useUser } from '@/context/UserContext';
import { Avatar } from '@/components/Avatar';
import { PageHeader } from '@/components/PageHeader';
import { useWishlist } from '@/hooks/useWishlist';
import { useInventory } from '@/hooks/useInventory';
import { CoffeeCard } from '@/components/CoffeeCard';
import { Tabs } from '@/components/Tabs';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StorageIcon from '@mui/icons-material/Storage';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { CoffeeInventoryCard } from '@/components/CoffeeInventoryCard';
import { SkeletonCard } from '@/components/Skeleton';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { uploadPhoto } from '@/lib/api/uploads';

type ProfileTabs = 'entries' | 'wishlist' | 'recipes' | 'inventory';

function ProfileContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addEntry, updateEntry, deleteEntry } = useEntries();
  const { likeRecipe, unlikeRecipe, deleteRecipe, updateRecipe, recipes } =
    useRecipes();
  const { user, updateUser } = useUser();
  const userId = user?.id ?? null;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<
    (typeof recipes)[0] | null
  >(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabs>('entries');
  const [uploading, setUploading] = useState(false);
  const { entries, loading } = useUserEntries(userId);
  const { wishlist } = useWishlist();
  const { inventory, loading: inventoryLoading } = useInventory();
  const userRecipes = recipes.filter((r) => r.userId === userId);

  useEffect(() => {
    setActiveTab((searchParams.get('tab') as ProfileTabs) || 'entries');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    router.push(pathname + `?${params.toString()}`);
  }, [activeTab]);

  async function handleAdd(data: EntryFormData): Promise<boolean> {
    const ok = await addEntry({ ...data, userId });
    if (ok) setShowForm(false);
    return ok;
  }

  async function handleEdit(
    entry: Entry,
    data: EntryFormData
  ): Promise<boolean> {
    const ok = await updateEntry(entry.id, { ...data, userId });
    if (ok) setEditingId(null);
    return ok;
  }

  const handleEditRecipe = (recipe: (typeof recipes)[0]) => {
    setEditingRecipe(recipe);
  };

  const handleSaveRecipe = async (data: RecipeFormData) => {
    if (editingRecipe) {
      const ok = await updateRecipe(editingRecipe.id, data);
      if (ok) setEditingRecipe(null);
      return ok;
    }
    return false;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(e.target.files[0]);
      await api.users.update(user.id, { photo: url });
      updateUser({ ...user, photo: url });
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setUploading(false);
    }
  };

  const distinctCoffees = new Set(entries.map((e) => e.coffeeId)).size;

  return (
    <div className="space-y-8">
      <PageHeader
        loading={!user}
        avatar={
          user && (
            <div
              className="relative group cursor-pointer"
              style={{ width: 64, height: 64 }}
            >
              <Avatar src={user.photo} name={user.name} size={64} rounded />
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <PhotoCameraIcon sx={{ fontSize: 20, color: '#fff' }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </label>
            </div>
          )
        }
        title={user?.name ?? '…'}
        meta={
          user && (
            <div className="flex items-center gap-3 text-sm">
              <span>
                {entries.length}{' '}
                {entries.length === 1 ? 'check-in' : 'check-ins'}
              </span>
              {distinctCoffees > 0 && (
                <>
                  <span>·</span>
                  <span>
                    {distinctCoffees} distinct{' '}
                    {distinctCoffees === 1 ? 'coffee' : 'coffees'}
                  </span>
                </>
              )}
              {userRecipes.length > 0 && (
                <>
                  <span>·</span>
                  <span>
                    {userRecipes.length}{' '}
                    {userRecipes.length === 1 ? 'recipe' : 'recipes'}
                  </span>
                </>
              )}
            </div>
          )
        }
      />
      <Tabs
        tabs={[
          {
            key: 'entries',
            label: 'Entries',
            count: entries.length,
            icon: <LocalCafeIcon sx={{ fontSize: 18 }} />,
          },
          {
            key: 'wishlist',
            label: 'Wishlist',
            count: wishlist.length,
            icon: <BookmarkIcon sx={{ fontSize: 18 }} />,
          },
          {
            key: 'recipes',
            label: 'Recipes',
            count: userRecipes.length,
            icon: <MenuBookIcon sx={{ fontSize: 18 }} />,
          },
          {
            key: 'inventory',
            label: 'Inventory',
            count: inventory.length,
            icon: <StorageIcon sx={{ fontSize: 18 }} />,
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'entries' && (
        <>
          {showForm && (
            <section>
              <p className="section-heading">New Entry</p>
              <EntryForm
                key="new"
                onSubmit={handleAdd}
                onCancel={() => setShowForm(false)}
                submitLabel="Add Entry"
              />
            </section>
          )}

          <section>
            {!userId ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Sign in to see your entries.
              </p>
            ) : loading ? (
              <ul
                className="space-y-2"
                style={{ listStyle: 'none', margin: 0, padding: 0 }}
              >
                {[1, 2, 3].map((i) => (
                  <li key={`skeleton-${i}`}>
                    <SkeletonCard />
                  </li>
                ))}
              </ul>
            ) : entries.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No entries yet.
              </p>
            ) : (
              <ul
                className="space-y-2"
                style={{ listStyle: 'none', margin: 0, padding: 0 }}
              >
                {entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    isEditing={editingId === entry.id}
                    onEdit={(e) => setEditingId(e.id)}
                    onDelete={deleteEntry}
                    onSave={(data) => handleEdit(entry, data)}
                    onCancel={() => setEditingId(null)}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {activeTab === 'recipes' && (
        <>
          {userRecipes.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No recipes yet.
            </p>
          ) : (
            <ul
              className="space-y-4"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {userRecipes.map((recipe) => {
                const isLiked = !!(
                  user &&
                  recipe.likedBy?.some((like) => like.userId === user.id)
                );
                const isOwner = user?.id === recipe.userId;
                return (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onLike={likeRecipe}
                    onUnlike={unlikeRecipe}
                    isLiked={isLiked}
                    isEditing={editingRecipe?.id === recipe.id}
                    onEdit={isOwner ? handleEditRecipe : undefined}
                    onSave={isOwner ? handleSaveRecipe : undefined}
                    onCancel={
                      isOwner ? () => setEditingRecipe(null) : undefined
                    }
                    onDelete={isOwner ? deleteRecipe : undefined}
                  />
                );
              })}
            </ul>
          )}
        </>
      )}

      {activeTab === 'wishlist' && (
        <section>
          {!userId ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sign in to see your wishlist.
            </p>
          ) : wishlist.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No coffees in your wishlist yet.
            </p>
          ) : (
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {wishlist.map((item) => (
                <li key={item.coffee.id}>
                  <CoffeeCard coffee={item.coffee} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {activeTab === 'inventory' && (
        <section>
          {!userId ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sign in to see your inventory.
            </p>
          ) : inventoryLoading ? (
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {[1, 2, 3].map((i) => (
                <li key={`skeleton-${i}`}>
                  <SkeletonCard />
                </li>
              ))}
            </ul>
          ) : inventory.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No coffee in your inventory yet.
            </p>
          ) : (
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {inventory.map((item) => (
                <CoffeeInventoryCard
                  key={item.id}
                  id={item.id}
                  coffee={item.coffee}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<div className="space-y-8">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
