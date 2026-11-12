'use client';

import { use, useMemo, useRef, useState } from 'react';
import { mutate } from 'swr';
import { api } from '@/lib/api';
import { uploadPhoto } from '@/lib/api/uploads';
import { EntryCard } from '@/components/EntryCard';
import { Button } from '@/components/Button';
import { SkeletonLoader } from '@/components/Spinner';
import { CoffeeCard } from '@/components/CoffeeCard';
import { type CoffeeFormData } from '@/components/CoffeeForm';
import { Avatar } from '@/components/Avatar';
import { PageHeader } from '@/components/PageHeader';
import { FollowListModal } from '@/components/FollowListModal';
import { useRoasterEntries } from '@/hooks/useEntries';
import { useCoffees } from '@/hooks/useCoffees';
import { useRoaster } from '@/hooks/useRoasters';
import { useRoasterFollow } from '@/hooks/useFollows';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

type Tab = 'entries' | 'coffees';

export default function RoasterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const roasterId = Number(id);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<Tab>('entries');
  const [showCoffeeForm, setShowCoffeeForm] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);

  const { roaster, mutate: mutateRoaster } = useRoaster(roasterId);
  const { following, followerCount, canFollow, isPending, toggle, followers } =
    useRoasterFollow(roasterId);
  const {
    entries,
    loading: entriesLoading,
    mutate: mutateEntries,
  } = useRoasterEntries(roasterId);
  const { coffees, loading: coffeesLoading } = useCoffees(roasterId);

  async function handleAddCoffee(data: CoffeeFormData): Promise<boolean> {
    try {
      await api.coffees.create({
        roasterId: data.roasterId,
        name: data.name,
        origin: data.origin || undefined,
        variety: data.variety || undefined,
        farm: data.farm || undefined,
        process: data.process || undefined,
        description: data.description || undefined,
        photoUrl: data.photoUrl,
      });
      await mutate(`/coffees?roasterId=${id}`);
      setShowCoffeeForm(false);
      return true;
    } catch {
      return false;
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !roaster) return;
    setUploading(true);
    try {
      const logoUrl = await uploadPhoto(file);
      await api.roasters.update(roasterId, { name: roaster.name, logoUrl });
      await mutateRoaster();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'entries', label: 'Check-ins', count: entries.length },
    { key: 'coffees', label: 'Coffees', count: coffees.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        avatar={
          <div className="relative group">
            <div
              className="rounded-xl overflow-hidden"
              style={{ width: 64, height: 64, background: 'var(--accent)' }}
            >
              <Avatar src={roaster?.logoUrl} name={roaster?.name} size={64} />
            </div>
            <Button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              variant="primary"
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.5)', padding: 0 }}
              aria-label="Upload logo"
            >
              <span
                className="material-icons"
                style={{ fontSize: 20, color: '#fff' }}
              >
                {uploading ? 'hourglass_empty' : 'upload'}
              </span>
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleLogoUpload}
            />
          </div>
        }
        title={roaster?.name ?? '…'}
        meta={
          <div className="space-y-1">
            {roaster?.location && <p className="text-sm">{roaster.location}</p>}
            {followerCount > 0 && (
              <p className="text-sm">
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
              </p>
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
        title={roaster?.name ?? 'Roaster'}
        followers={followers}
        followingUsers={[]}
        followingRoasters={[]}
        showFollowingRoasters={false}
      />

      <div className="flex gap-1 pb-4">
        {tabs.map(({ key, label, count }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="relative px-4 pb-3 text-sm font-medium transition-colors"
              style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {label}
              {count > 0 && (
                <span
                  className="ml-1.5 text-xs rounded-full px-1.5 py-0.5"
                  style={{
                    background: active ? 'var(--accent)' : 'var(--bg-subtle)',
                    color: active ? 'var(--accent-fg)' : 'var(--text-muted)',
                  }}
                >
                  {count}
                </span>
              )}
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all"
                style={{ background: active ? 'var(--accent)' : 'transparent' }}
              />
            </button>
          );
        })}
      </div>

      {tab === 'entries' && (
        <>
          {entriesLoading ? (
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
          ) : entries.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No check-ins yet.
            </p>
          ) : (
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'coffees' && (
        <>
          {coffeesLoading ? (
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="card overflow-hidden p-4 sm:p-6 space-y-4"
                >
                  <div className="space-y-3">
                    <SkeletonLoader width="60%" height={20} />
                    <SkeletonLoader width="100%" height={16} />
                    <SkeletonLoader width="80%" height={16} />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex-1 space-y-2">
                      <SkeletonLoader width="40%" height={14} />
                      <SkeletonLoader width="50%" height={12} />
                    </div>
                    <SkeletonLoader width={40} height={40} />
                  </div>
                </div>
              ))}
            </ul>
          ) : coffees.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No coffees yet.
            </p>
          ) : (
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {coffees.map((coffee) => {
                return (
                  <li key={coffee.id}>
                    <CoffeeCard
                      coffee={coffee}
                      onEntryAdded={() => mutateEntries()}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
