'use client';

import { use, useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { SkeletonLoader } from '@/components/Spinner';
import { EntryCard } from '@/components/EntryCard';
import { RecipeCard } from '@/components/RecipeCard';
import { PageHeader } from '@/components/PageHeader';
import { Tabs } from '@/components/Tabs';
import { FollowListModal } from '@/components/FollowListModal';
import { useUsers } from '@/hooks/useUsers';
import { useRecipes } from '@/hooks/useRecipes';
import { useUser } from '@/context/UserContext';
import { useUserFollow } from '@/hooks/useFollows';
import { useInventory } from '@/hooks/useInventory';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StorageIcon from '@mui/icons-material/Storage';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

export default function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<
    'entries' | 'recipes' | 'inventory'
  >('entries');
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<
    'followers' | 'following-users' | 'following-roasters'
  >('followers');

  const {
    user,
    userEntries,
    isUserEntriesLoading,
    userCoffees,
    userRecipes,
    isUserRecipesLoading,
  } = useUsers(id);
  const { likeRecipe, unlikeRecipe } = useRecipes();
  const { user: currentUser } = useUser();
  const { inventory, loading: inventoryLoading } = useInventory();
  const {
    following,
    followerCount,
    followingCount,
    canFollow,
    isPending,
    toggle,
    followers,
    followingUsers,
    followingRoasters,
  } = useUserFollow(id);

  return (
    <div className="space-y-6">
      <PageHeader
        avatar={
          <Avatar src={user?.photo} name={user?.name} size={64} rounded />
        }
        title={user?.name ?? '…'}
        meta={
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <span>
              {userEntries.length}{' '}
              {userEntries.length === 1 ? 'check-in' : 'check-ins'}
            </span>
            {userCoffees.length > 0 && (
              <>
                <span>·</span>
                <span>
                  {userCoffees.length} distinct{' '}
                  {userCoffees.length === 1 ? 'coffee' : 'coffees'}
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
            {followerCount > 0 && (
              <>
                <span>·</span>
                <button
                  onClick={() => setShowFollowModal(true)}
                  style={{
                    color: 'var(--accent)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  className="hover:underline transition-opacity"
                >
                  {followerCount}{' '}
                  {followerCount === 1 ? 'follower' : 'followers'}
                </button>
              </>
            )}
            {followingCount > 0 && (
              <>
                <span>·</span>
                <button
                  onClick={() => setShowFollowModal(true)}
                  style={{
                    color: 'var(--accent)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  className="hover:underline transition-opacity"
                >
                  {followingCount} following
                </button>
              </>
            )}
          </div>
        }
        right={
          canFollow ? (
            <Button
              onClick={toggle}
              disabled={isPending}
              variant={following ? 'secondary' : 'primary'}
              loading={isPending}
              size="md"
            >
              {!isPending && (
                <>
                  {following ? (
                    <>
                      <PersonRemoveIcon sx={{ fontSize: 16 }} /> Unfollow
                    </>
                  ) : (
                    <>
                      <PersonAddIcon sx={{ fontSize: 16 }} /> Follow
                    </>
                  )}
                </>
              )}
            </Button>
          ) : undefined
        }
      />

      <FollowListModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        title={user?.name ?? 'User'}
        followers={followers}
        followingUsers={followingUsers}
        followingRoasters={followingRoasters}
        showFollowingRoasters={true}
      />

      {(userRecipes.length > 0 ||
        (currentUser?.id === id && inventory.length > 0)) && (
        <Tabs
          tabs={[
            {
              key: 'entries',
              label: 'Check-ins',
              count: userEntries.length,
              icon: <LocalCafeIcon sx={{ fontSize: 18 }} />,
            },
            {
              key: 'recipes',
              label: 'Recipes',
              count: userRecipes.length,
              icon: <MenuBookIcon sx={{ fontSize: 18 }} />,
            },
            ...(currentUser?.id === id && inventory.length > 0
              ? [
                  {
                    key: 'inventory' as const,
                    label: 'Inventory',
                    count: inventory.length,
                    icon: <StorageIcon sx={{ fontSize: 18 }} />,
                  },
                ]
              : []),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {activeTab === 'entries' && (
        <>
          {isUserEntriesLoading ? (
            <ul
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
            </ul>
          ) : userEntries.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No check-ins yet.
            </p>
          ) : (
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {userEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </>
      )}

      {activeTab === 'recipes' && (
        <>
          {isUserRecipesLoading ? (
            <ul
              className="space-y-4"
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
                  <div className="space-y-3">
                    <SkeletonLoader width="60%" height={20} />
                    <SkeletonLoader width="100%" height={16} />
                    <SkeletonLoader width="80%" height={16} />
                  </div>
                  <div className="space-y-2">
                    <SkeletonLoader width="40%" height={14} />
                    <SkeletonLoader width="50%" height={14} />
                  </div>
                </div>
              ))}
            </ul>
          ) : userRecipes.length === 0 ? (
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
                  currentUser &&
                  recipe.likedBy?.some((like) => like.userId === currentUser.id)
                );
                return (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onLike={likeRecipe}
                    onUnlike={unlikeRecipe}
                    isLiked={isLiked}
                    onDelete={
                      currentUser?.id === recipe.userId ? () => {} : undefined
                    }
                  />
                );
              })}
            </ul>
          )}
        </>
      )}

      {activeTab === 'inventory' && (
        <>
          {inventoryLoading ? (
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="card overflow-hidden p-4 sm:p-6 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <SkeletonLoader width="50%" height={16} />
                      <SkeletonLoader width="40%" height={14} />
                    </div>
                    <SkeletonLoader
                      width={48}
                      height={48}
                      className="rounded"
                    />
                  </div>
                </div>
              ))}
            </ul>
          ) : inventory.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No coffee in inventory yet.
            </p>
          ) : (
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {inventory.map((item) => (
                <div key={item.id} className="card overflow-hidden p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-h)' }}
                      >
                        {item.coffee?.name}
                      </p>
                      <p
                        className="text-sm mt-0.5 truncate"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {item.coffee?.roaster.name}
                      </p>
                      {item.roastDate && (
                        <p
                          className="text-xs mt-2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Roasted:{' '}
                          {new Date(item.roastDate).toLocaleDateString()}
                        </p>
                      )}
                      {item.notes && (
                        <p
                          className="text-xs mt-2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <div
                        className="text-center p-2 rounded"
                        style={{
                          background: 'var(--bg)',
                          minWidth: 48,
                        }}
                      >
                        <p
                          className="text-lg font-semibold"
                          style={{ color: 'var(--text-h)' }}
                        >
                          {item.quantity}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          unit{item.quantity !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
