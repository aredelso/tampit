'use client';

import { useState } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeForm, type RecipeFormData } from '@/components/RecipeForm';
import { Button } from '@/components/Button';
import { SkeletonLoader } from '@/components/Spinner';
import { useUser } from '@/context/UserContext';
import { PageHeader } from '@/components/PageHeader';

export default function RecipesPage() {
  const { user } = useUser();
  const {
    recipes,
    loading,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    likeRecipe,
    unlikeRecipe,
  } = useRecipes();
  const [isCreating, setIsCreating] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<
    (typeof recipes)[0] | null
  >(null);

  const handleCreateRecipe = async (data: RecipeFormData) => {
    try {
      await createRecipe(data);
      setIsCreating(false);
      return true;
    } catch (err) {
      console.error('Failed to create recipe:', err);
      return false;
    }
  };

  const handleSaveRecipe = async (data: RecipeFormData) => {
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, data);
        setEditingRecipe(null);
      }
      return true;
    } catch (err) {
      console.error('Failed to save recipe:', err);
      return false;
    }
  };

  const handleEditRecipe = (recipe: (typeof recipes)[0]) => {
    setEditingRecipe(recipe);
    setIsCreating(false);
  };

  const handleDeleteRecipe = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await deleteRecipe(id);
    } catch (err) {
      console.error('Failed to delete recipe:', err);
    }
  };

  const handleLikeRecipe = (id: number) => {
    if (!user) return;
    likeRecipe(id);
  };

  const handleUnlikeRecipe = (id: number) => {
    if (!user) return;
    unlikeRecipe(id);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pour Over Recipes"
        right={
          user && (
            <Button
              onClick={() => setIsCreating((v) => !v)}
              variant={isCreating ? 'secondary' : 'primary'}
              size="lg"
            >
              {isCreating ? 'Cancel' : '+ Create Recipe'}
            </Button>
          )
        }
      />

      {isCreating && (
        <RecipeForm
          onSubmit={handleCreateRecipe}
          onCancel={() => setIsCreating(false)}
          submitLabel="Create"
        />
      )}

      {loading ? (
        <ul
          className="space-y-4"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card overflow-hidden p-4 sm:p-6 space-y-4">
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
      ) : recipes.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>
          No recipes yet.{' '}
          {user ? 'Create the first one!' : 'Log in to create recipes.'}
        </p>
      ) : (
        <ul
          className="space-y-4"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {recipes.map((recipe) => {
            const isLiked = !!(
              user && recipe.likedBy?.some((like) => like.userId === user.id)
            );
            const isOwner = user?.id === recipe.userId;
            return (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onLike={handleLikeRecipe}
                onUnlike={handleUnlikeRecipe}
                isLiked={isLiked}
                isEditing={editingRecipe?.id === recipe.id}
                onEdit={isOwner ? handleEditRecipe : undefined}
                onSave={isOwner ? handleSaveRecipe : undefined}
                onCancel={isOwner ? () => setEditingRecipe(null) : undefined}
                onDelete={isOwner ? handleDeleteRecipe : undefined}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
