'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar } from './Avatar';
import type { UserSummary, RoasterSummary } from '@/lib/api/follows';

type Tab = 'followers' | 'following-users' | 'following-roasters';

export function FollowListModal({
  isOpen,
  onClose,
  title,
  followers,
  followingUsers,
  followingRoasters,
  showFollowingRoasters = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  followers: UserSummary[];
  followingUsers: UserSummary[];
  followingRoasters: RoasterSummary[];
  showFollowingRoasters?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('followers');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg shadow-lg overflow-hidden"
        style={{ background: 'var(--bg-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none"
            style={{ color: 'var(--text-muted)' }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setActiveTab('followers')}
            className="flex-1 px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color:
                activeTab === 'followers'
                  ? 'var(--accent)'
                  : 'var(--text-muted)',
              borderBottom:
                activeTab === 'followers' ? '2px solid var(--accent)' : 'none',
              marginBottom: activeTab === 'followers' ? '-2px' : 0,
            }}
          >
            Followers ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab('following-users')}
            className="flex-1 px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color:
                activeTab === 'following-users'
                  ? 'var(--accent)'
                  : 'var(--text-muted)',
              borderBottom:
                activeTab === 'following-users'
                  ? '2px solid var(--accent)'
                  : 'none',
              marginBottom: activeTab === 'following-users' ? '-2px' : 0,
            }}
          >
            Following Users ({followingUsers.length})
          </button>
          {showFollowingRoasters && (
            <button
              onClick={() => setActiveTab('following-roasters')}
              className="flex-1 px-4 py-2 text-sm font-medium transition-colors"
              style={{
                color:
                  activeTab === 'following-roasters'
                    ? 'var(--accent)'
                    : 'var(--text-muted)',
                borderBottom:
                  activeTab === 'following-roasters'
                    ? '2px solid var(--accent)'
                    : 'none',
                marginBottom: activeTab === 'following-roasters' ? '-2px' : 0,
              }}
            >
              Following Roasters ({followingRoasters.length})
            </button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {activeTab === 'followers' && <UserList users={followers} />}
          {activeTab === 'following-users' && (
            <UserList users={followingUsers} />
          )}
          {activeTab === 'following-roasters' && (
            <RoasterList roasters={followingRoasters} />
          )}
        </div>
      </div>
    </div>
  );
}

function UserList({ users }: { users: UserSummary[] }) {
  if (users.length === 0) {
    return (
      <div
        className="p-4 text-center text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        No users
      </div>
    );
  }

  return (
    <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
      {users.map((user) => (
        <li key={user.id}>
          <Link
            href={`/user/${user.id}`}
            className="flex items-center gap-3 p-3 hover:opacity-80 transition-opacity"
          >
            <Avatar src={user.photo} name={user.name} size={32} />
            <span className="font-medium">{user.name ?? 'Unknown'}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function RoasterList({ roasters }: { roasters: RoasterSummary[] }) {
  if (roasters.length === 0) {
    return (
      <div
        className="p-4 text-center text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        No roasters
      </div>
    );
  }

  return (
    <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
      {roasters.map((roaster) => (
        <li key={roaster.id}>
          <Link
            href={`/roaster/${roaster.id}`}
            className="flex items-center gap-3 p-3 hover:opacity-80 transition-opacity"
          >
            <Avatar
              src={roaster.logoUrl}
              name={roaster.name}
              size={32}
              rounded
            />
            <span className="font-medium">{roaster.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
