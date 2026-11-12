'use client';

import type { Entry } from '@shared/entry';
import { Avatar } from './Avatar';
import { Button } from './Button';
import NextLink from 'next/link';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { EntryForm, type EntryFormData } from './EntryForm';
import { useEntries } from '@/hooks/useEntries';
import { useUser } from '@/context/UserContext';
import { useUserFollow } from '@/hooks/useFollows';
import { StarRating } from './StarRating';
import { BREW_ICONS } from '@/lib/constants';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { Spinner } from './Spinner';

export function EntryCard({
  entry,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onToggleFollow,
}: {
  entry: Entry;
  isEditing?: boolean;
  onEdit?: (e: Entry) => void;
  onDelete?: (id: number) => void;
  onSave?: (data: EntryFormData) => Promise<boolean>;
  onCancel?: () => void;
  onToggleFollow?: () => void;
}) {
  const [hoveredLikes, setHoveredLikes] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLikeLoading, setCommentLikeLoading] = useState<number | null>(
    null
  );
  const [commentSubmitLoading, setCommentSubmitLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showMenu]);
  const { likeEntry, unlikeEntry, commentEntry, likeComment, unlikeComment } =
    useEntries();
  const { user } = useUser();
  const isLiked = !!(
    user && entry.likedBy?.map((u) => u.userId)?.includes(user.id)
  );

  const followData = useUserFollow(entry.userId || '');
  const {
    following,
    canFollow,
    toggle: toggleFollow,
    isPending: isFollowPending,
  } = followData;

  function handleToggleLike(entryId: number, isLiked: boolean) {
    if (!user) return;
    setLikeLoading(true);
    if (isLiked) {
      unlikeEntry(entryId).finally(() => setLikeLoading(false));
    } else {
      likeEntry(entryId).finally(() => setLikeLoading(false));
    }
  }

  function handleToggleFollow() {
    onToggleFollow?.();
    toggleFollow();
  }

  if (isEditing && onSave && onCancel) {
    return (
      <EntryForm
        initialValues={{
          roaster: entry.roasterName,
          coffee: entry.coffeeName,
          origin: entry.origin ?? '',
          brewMethod: entry.brewMethod,
          dose: entry.dose,
          waterMl: entry.waterMl,
          notes: entry.notes ?? '',
          rating: entry.rating ?? undefined,
          photoUrl: entry.photoUrl ?? undefined,
          flavorNotes: entry.flavorNotes ?? [],
        }}
        onSubmit={onSave}
        onCancel={onCancel}
        submitLabel="Save"
      />
    );
  }

  return (
    <li className="card overflow-hidden">
      <div className="flex justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5 pb-3">
        <div className="flex items-center gap-2">
          {entry.userId ? (
            <NextLink
              href={`/user/${entry.userId}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar
                src={entry.userPhoto}
                name={entry.userName}
                size={48}
                rounded
              />
              {entry.userName && (
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-h)' }}
                >
                  {entry.userName}
                </span>
              )}
            </NextLink>
          ) : (
            <>
              <Avatar
                src={entry.userPhoto}
                name={entry.userName}
                size={48}
                rounded
              />
              {entry.userName && (
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-h)' }}
                >
                  {entry.userName}
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {(onEdit || onDelete || canFollow) && (
            <div ref={menuRef} className="relative">
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
                  className="absolute right-0 z-20 rounded-lg shadow-lg py-1 min-w-[140px]"
                  style={{
                    top: 'calc(60% + 4px)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {canFollow && (
                    <button
                      className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 flex items-center gap-2"
                      style={{ color: 'var(--text-h)' }}
                      onClick={() => {
                        handleToggleFollow();
                        setShowMenu(false);
                      }}
                      disabled={isFollowPending}
                    >
                      <span>
                        {following ? 'Unfollow' : 'Follow'} {entry.userName}
                      </span>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: 'var(--text-h)' }}
                      onClick={() => {
                        onEdit?.(entry);
                        setShowMenu(false);
                      }}
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: 'var(--error, #e11d48)' }}
                      onClick={() => {
                        onDelete?.(entry.id);
                        setShowMenu(false);
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {entry.photoUrl && (
        <img
          src={entry.photoUrl}
          alt=""
          className="w-full object-cover"
          style={{ maxHeight: 220 }}
        />
      )}
      <div
        className="flex items-start gap-4 my-4"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="w-full px-4 sm:px-6 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="relative flex items-center justify-center rounded-sm shrink-0 overflow-hidden"
                style={{
                  width: 48,
                  height: 48,
                  background: 'var(--accent)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                <Avatar
                  src={entry.coffeePhotoUrl ?? entry.roasterLogoUrl}
                  name={entry.coffeeName}
                  size={48}
                />
              </div>
              <div className="min-w-0 flex items-start flex-col">
                <NextLink
                  href={`/coffee/${entry.coffeeId}`}
                  className="hover:underline text-sm font-medium"
                  style={{ color: 'var(--text-h)' }}
                >
                  {entry.coffeeName}
                </NextLink>
                <div className="flex items-center text-sm mt-0.5">
                  <NextLink
                    href={`/roaster/${entry.roasterId}`}
                    className="hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {entry.roasterName}
                  </NextLink>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {entry.rating != null && <StarRating value={entry.rating} />}
            </div>
          </div>
          {entry.notes && (
            <div className="text-md my-4 flex items-center">{entry.notes}</div>
          )}
          {entry.flavorNotes && entry.flavorNotes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 my-3">
              {entry.flavorNotes.map((tag) => (
                <NextLink
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  className="tag-pill"
                >
                  {tag}
                </NextLink>
              ))}
            </div>
          )}
          <div
            className="flex justify-between items-center gap-2 text-sm mt-6"
            style={{ color: 'var(--text-muted)' }}
          >
            <div className="flex items-center gap-1">
              {entry.brewMethod &&
                (BREW_ICONS[entry.brewMethod] ? (
                  <>
                    <img
                      src={BREW_ICONS[entry.brewMethod]}
                      alt={entry.brewMethod}
                      style={{ width: 14, height: 14 }}
                    />
                    <span>{entry.brewMethod}</span>
                  </>
                ) : (
                  <span>{entry.brewMethod}</span>
                ))}
              {entry.dose || entry.waterMl ? ' - ' : ''}
              {entry.dose ? `${entry.dose}g / ` : ''}
              {entry.waterMl ? `${entry.waterMl}ml` : ''}
            </div>
            <time
              suppressHydrationWarning
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {moment(entry.createdAt).fromNow()}
            </time>
          </div>
        </div>
      </div>
      <div className="flex text-xs px-4 pb-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          style={{
            color: isLiked ? 'var(--red)' : 'var(--text-muted)',
          }}
          loading={likeLoading}
          disabled={likeLoading}
          onMouseEnter={() => setHoveredLikes(true)}
          onMouseLeave={() => setHoveredLikes(false)}
          onClick={() => handleToggleLike(entry.id, isLiked)}
        >
          {!likeLoading && (
            <FavoriteIcon
              sx={{
                fontSize: 14,
                color: isLiked ? 'var(--red)' : undefined,
                transition: 'transform 0.2s ease, color 0.2s ease',
                cursor: 'pointer',
              }}
            />
          )}
          {hoveredLikes && entry.likedBy && entry.likedBy.length > 0 && (
            <div
              className="pointer-events-none absolute z-10"
              style={{
                bottom: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <div
                className="block rounded-lg px-2.5 py-1.5 text-xs shadow-lg text-left"
                style={{ background: 'var(--text-h)', color: 'var(--bg)' }}
              >
                {entry.likedBy.map((l) => (
                  <div key={l.userId}>{l.userName}</div>
                ))}
              </div>
              <div
                className="block w-2 h-2 mx-auto -mt-1 rotate-45"
                style={{ background: 'var(--text-h)' }}
              />
            </div>
          )}
          <span
            className="flex items-center"
            style={{ color: 'var(--text-muted)' }}
          >
            {entry.likes}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          style={{
            color: showComment ? 'var(--accent)' : 'var(--text-muted)',
          }}
          onClick={() => setShowComment((v) => !v)}
        >
          <ChatBubbleIcon sx={{ fontSize: 14 }} />
          <span
            className="flex items-center"
            style={{ color: 'var(--text-muted)' }}
          >
            {entry.comments?.length ?? 0}
          </span>
        </Button>
      </div>

      {showComment && (
        <div>
          {entry.comments && entry.comments.length > 0 && (
            <div
              className="max-h-48 overflow-y-auto px-4 sm:px-6 py-3 space-y-2"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {entry.comments.map((c) => {
                const commentLiked = !!(
                  user && c.likedBy?.at(-1)?.userId === user.id
                );
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <Avatar src={c.userPhoto} name={c.userName} size={32} />
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-h)' }}
                        >
                          {c.userName}
                          {' · '}
                          <span
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {moment(c.createdAt).fromNow()}
                          </span>
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {c.content}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className="flex items-center gap-0.5 text-xs disabled:opacity-50"
                        style={{
                          color: commentLiked ? 'var(--red)' : undefined,
                          cursor:
                            commentLikeLoading === c.id
                              ? 'not-allowed'
                              : 'pointer',
                        }}
                        onClick={() => {
                          setCommentLikeLoading(c.id);
                          if (commentLiked) {
                            unlikeComment(entry.id, c.id).finally(() =>
                              setCommentLikeLoading(null)
                            );
                          } else {
                            likeComment(entry.id, c.id).finally(() =>
                              setCommentLikeLoading(null)
                            );
                          }
                        }}
                        disabled={commentLikeLoading === c.id}
                      >
                        {commentLikeLoading === c.id ? (
                          <Spinner size={11} color="var(--red)" />
                        ) : (
                          <FavoriteIcon sx={{ fontSize: 13 }} />
                        )}
                        {c.likes > 0 && <span>{c.likes}</span>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div
            className="flex gap-2 px-4 sm:px-6 py-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <input
              className="flex-1 text-sm rounded-lg px-3 py-1.5 outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-h)',
              }}
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  commentText.trim() &&
                  !commentSubmitLoading
                ) {
                  setCommentSubmitLoading(true);
                  commentEntry(entry.id, commentText.trim()).finally(() => {
                    setCommentSubmitLoading(false);
                    setCommentText('');
                  });
                }
              }}
              autoFocus
              disabled={commentSubmitLoading}
            />
            <Button
              variant="ghost"
              size="md"
              disabled={!commentText.trim() || commentSubmitLoading}
              loading={commentSubmitLoading}
              onClick={() => {
                if (!commentText.trim() || commentSubmitLoading) return;
                setCommentSubmitLoading(true);
                commentEntry(entry.id, commentText.trim()).finally(() => {
                  setCommentSubmitLoading(false);
                  setCommentText('');
                });
              }}
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
