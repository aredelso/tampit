'use client';

import type { Recipe } from '@shared/recipe';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { RecipeForm, type RecipeFormData } from './RecipeForm';
import NextLink from 'next/link';
import moment from 'moment';
import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { formatBrewTime } from '@/utils/formatTime';

export function RecipeCard({
  recipe,
  onLike,
  onUnlike,
  isLiked,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  recipe: Recipe;
  onLike: (id: number) => void;
  onUnlike: (id: number) => void;
  isLiked: boolean;
  isEditing?: boolean;
  onEdit?: (recipe: Recipe) => void;
  onSave?: (data: RecipeFormData) => Promise<boolean>;
  onCancel?: () => void;
  onDelete?: (id: number) => void;
}) {
  const [hoveredLikes, setHoveredLikes] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const isOwner = user?.id === recipe.userId;

  useEffect(() => {
    if (!showMenu) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showMenu]);

  if (isEditing && onSave && onCancel) {
    return (
      <RecipeForm
        initialValues={recipe}
        onSubmit={onSave}
        onCancel={onCancel}
        submitLabel="Save"
      />
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5 pb-3">
        <div className="flex items-center gap-2">
          {recipe.userId ? (
            <NextLink
              href={`/user/${recipe.userId}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar
                src={recipe.userPhoto}
                name={recipe.userName}
                size={48}
                rounded
              />
              {recipe.userName && (
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-h)' }}
                >
                  {recipe.userName}
                </span>
              )}
            </NextLink>
          ) : (
            <>
              <Avatar
                src={recipe.userPhoto}
                name={recipe.userName}
                size={48}
                rounded
              />
              {recipe.userName && (
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-h)' }}
                >
                  {recipe.userName}
                </span>
              )}
            </>
          )}
        </div>
        {isOwner && (
          <div ref={menuRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full p-1"
              onClick={() => setShowMenu((v) => !v)}
              aria-label="More options"
            >
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </Button>
            {showMenu && (
              <div
                className="absolute right-0 z-20 rounded-lg shadow-lg py-1 min-w-[120px]"
                style={{
                  top: 'calc(60% + 4px)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                {onEdit && onSave && onCancel && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: 'var(--text-h)' }}
                    onClick={() => {
                      onEdit(recipe);
                      setShowMenu(false);
                    }}
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: '#e11d48' }}
                    onClick={() => {
                      onDelete(recipe.id);
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
      <div className="px-4 sm:px-6 py-4 space-y-3">
        <div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-h)' }}
          >
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              {recipe.description}
            </p>
          )}
          {recipe.brewMethod && (
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 500 }}>Method:</span>{' '}
              {recipe.brewMethod}
            </p>
          )}
        </div>

        {(recipe.dose ||
          recipe.brewTime ||
          (recipe.phases && recipe.phases.length > 0)) && (
          <div className="grid grid-cols-3 gap-3 text-sm">
            {recipe.dose && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Coffee Dose:</span>
                <p style={{ color: 'var(--text-h)' }}>{recipe.dose}g</p>
              </div>
            )}
            {recipe.grindSize && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Grind:</span>{' '}
                <p style={{ color: 'var(--text-h)' }}>
                  {recipe.grindSize}
                  {isNaN(Number(recipe.grindSize)) ? '' : ' µm'}
                </p>
              </div>
            )}
            {recipe.brewTime && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>
                  Total Brew Time:
                </span>
                <p style={{ color: 'var(--text-h)' }}>
                  {formatBrewTime(recipe.brewTime)}
                </p>
              </div>
            )}
            {recipe.phases && recipe.phases.length > 0 && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Water:</span>
                <p style={{ color: 'var(--text-h)' }}>
                  {recipe.phases.reduce(
                    (sum, p) => sum + (p.waterAmount || 0),
                    0
                  )}
                  ml
                </p>
              </div>
            )}
          </div>
        )}

        {recipe.phases && recipe.phases.length > 0 && (
          <div>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--text-h)' }}
            >
              Steps:
            </p>
            <div className="space-y-2">
              {recipe.phases.map((phase, idx) => (
                <div
                  key={idx}
                  className="bg-opacity-50 rounded p-2"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {phase.waterTemp}°C • {phase.waterAmount}ml
                    {phase.startTime !== undefined &&
                      ` • Start: ${formatBrewTime(phase.startTime)}`}
                  </p>
                  {phase.notes && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {phase.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.notes && (
          <div>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--text-h)' }}
            >
              Notes:
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {recipe.notes}
            </p>
          </div>
        )}

        <div
          className="flex justify-between items-center text-sm pt-3"
          style={{
            color: 'var(--text-muted)',
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            loading={likeLoading}
            disabled={likeLoading}
            onMouseEnter={() => setHoveredLikes(true)}
            onMouseLeave={() => setHoveredLikes(false)}
            onClick={() => {
              setLikeLoading(true);
              isLiked ? onUnlike(recipe.id) : onLike(recipe.id);
              setTimeout(() => setLikeLoading(false), 300);
            }}
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
            {recipe.likes}
            {hoveredLikes && recipe.likedBy && recipe.likedBy.length > 0 && (
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
                  {recipe.likedBy.map((l) => (
                    <div key={l.userId}>{l.userName}</div>
                  ))}
                </div>
                <div
                  className="block w-2 h-2 mx-auto -mt-1 rotate-45"
                  style={{ background: 'var(--text-h)' }}
                />
              </div>
            )}
          </Button>
          <time className="text-xs">{moment(recipe.createdAt).fromNow()}</time>
        </div>
      </div>
    </div>
  );
}
