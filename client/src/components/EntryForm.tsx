'use client';

import { useEffect, useRef, useState } from 'react';
import type { EntryPayload, Recipe } from '@/lib/api';
import { uploadPhoto } from '@/lib/api/uploads';
import { BREW_METHODS } from '@/lib/constants';
import { useCoffees } from '../hooks/useCoffees';
import { useRecipes } from '../hooks/useRecipes';
import { StarRating } from './StarRating';
import { Button } from './Button';
import { Combobox, type ComboboxOption } from './Combobox';
import { TagInput } from './TagInput';
import { RecipeForm, type RecipeFormData } from './RecipeForm';
import type { Coffee } from '@shared/coffee';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { RoasterCombobox } from './RoasterCombobox';
import { CoffeeCombobox } from './CoffeeCombobox';

export type EntryFormData = Omit<EntryPayload, 'userId'>;

interface Props {
  coffeeId?: number;
  initialValues?: Partial<EntryFormData>;
  onSubmit: (data: EntryFormData) => Promise<boolean>;
  onCancel?: () => void;
  submitLabel?: string;
}

const DEFAULTS: EntryFormData = {
  roaster: '',
  roasterId: undefined,
  coffee: '',
  coffeeId: undefined,
  origin: '',
  brewMethod: '',
  dose: 0,
  waterMl: 0,
  notes: '',
  rating: undefined,
  photoUrl: undefined,
  flavorNotes: [],
  recipeId: undefined,
};

function LocationCombobox({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setOptions([]);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(value)}&limit=6`
        );
        const data = await res.json();
        const labels: string[] = Array.from(
          new Set(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.features.map((f: any) => {
              const p = f.properties;
              const parts = [p.name];
              if (p.state && p.state !== p.name) parts.push(p.state);
              if (p.countrycode) parts.push(p.countrycode.toUpperCase());
              return parts.filter(Boolean).join(', ');
            })
          )
        );
        setOptions(labels.map((label) => ({ label })));
      } catch {
        /* silently fail */
      }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [value]);

  return (
    <Combobox
      value={value}
      onChange={onChange}
      options={options}
      placeholder="e.g. San Diego, CA"
      autoFocus={autoFocus}
    />
  );
}

function RecipeCombobox({
  value,
  onChange,
  onAdd,
}: {
  value: string;
  onChange: (v: string, id?: Recipe) => void;
  onAdd?: () => void;
}) {
  const { recipes } = useRecipes();
  const options = recipes
    .filter((r) => r.title.toLowerCase().includes(value.toLowerCase()))
    .map((r) => ({
      label: r.title,
      sublabel: r.brewMethod ?? undefined,
      data: r,
    }));

  return (
    <Combobox
      value={value}
      onChange={onChange}
      onSelect={(opt) => onChange(opt.label, opt.data as Recipe)}
      options={options}
      placeholder="e.g. Classic Pour Over"
      minChars={0}
      addLabel="Add Recipe"
      onAdd={onAdd}
    />
  );
}

export function EntryForm({
  coffeeId,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Add Entry',
}: Props) {
  const [values, setValues] = useState<EntryFormData>({
    ...DEFAULTS,
    ...initialValues,
    coffeeId,
  });
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roasterConfirmed, setRoasterConfirmed] = useState(
    !!initialValues?.roaster
  );
  const [coffeeConfirmed, setCoffeeConfirmed] = useState(
    !!initialValues?.coffee
  );
  const [isNewRoaster, setIsNewRoaster] = useState<boolean | undefined>(false);
  const [isNewCoffee, setIsNewCoffee] = useState<boolean | undefined>(false);
  const [newRoasterLocation, setNewRoasterLocation] = useState('');
  const [recipeSearchValue, setRecipeSearchValue] = useState('');
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const { createRecipe } = useRecipes();

  useEffect(() => {
    setValues({ ...DEFAULTS, ...initialValues, coffeeId });
    setRoasterConfirmed(!!initialValues?.roaster);
  }, [initialValues, coffeeId]);

  function set<K extends keyof EntryFormData>(key: K, value: EntryFormData[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      set('photoUrl', url);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ok = await onSubmit(values);
      setIsNewRoaster(false);
      setNewRoasterLocation('');
      setRecipeSearchValue('');
      if (ok) setValues(DEFAULTS);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRecipeCreate(data: RecipeFormData): Promise<boolean> {
    const recipe = await createRecipe(data);
    if (recipe) {
      set('recipeId', recipe.id);
      setRecipeSearchValue(recipe.title);
      setShowRecipeForm(false);
      return true;
    }
    return false;
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {!coffeeId && (
        <>
          <div>
            <label className="label">Roaster</label>
            <RoasterCombobox
              value={values.roaster}
              onChange={(v) => {
                set('roaster', v);
                if (!v.trim()) setRoasterConfirmed(false);
              }}
              onSelect={(roaster) =>
                set('roasterId', (roaster.data as { value: number }).value)
              }
              onConfirm={(isNew) => {
                setRoasterConfirmed(true);
                if (isNew) {
                  setIsNewRoaster(true);
                  setIsNewCoffee(true);
                }
              }}
            />
          </div>

          {isNewRoaster && (
            <div>
              <label className="label">Location</label>
              <LocationCombobox
                value={newRoasterLocation}
                onChange={setNewRoasterLocation}
                autoFocus
              />
            </div>
          )}

          {roasterConfirmed &&
            (!isNewRoaster && values.roasterId ? (
              <div>
                <label className="label">Coffee</label>
                <CoffeeCombobox
                  roasterId={values.roasterId}
                  value={values.coffee}
                  onChange={(v) => {
                    set('coffee', v);
                    if (!v.trim()) setCoffeeConfirmed(false);
                  }}
                  onSelect={(coffee) =>
                    set('coffeeId', (coffee.data as { value: number }).value)
                  }
                  onConfirm={(isNew) => {
                    setCoffeeConfirmed(true);
                    if (isNew) setIsNewCoffee(true);
                  }}
                />
              </div>
            ) : (
              <div>
                <label className="label">Coffee</label>
                <input
                  value={values.coffee}
                  onChange={(e) => set('coffee', e.target.value)}
                  placeholder="e.g. Ethiopia Yirgacheffe"
                  className="input"
                />
              </div>
            ))}
        </>
      )}

      {isNewCoffee && (
        <div>
          <label className="label">Origin</label>
          <input
            value={values.origin}
            onChange={(e) => set('origin', e.target.value)}
            placeholder="e.g. Ethiopia"
            className="input"
          />
        </div>
      )}

      {(coffeeId || (isNewCoffee && values.coffee)) && (
        <>
          <div>
            <label className="label">Recipe (optional)</label>
            {!showRecipeForm ? (
              <RecipeCombobox
                value={recipeSearchValue}
                onChange={(title, recipe) => {
                  setRecipeSearchValue(title);
                  if (recipe) {
                    console.log(recipe);
                    set('recipeId', recipe.id);
                    set('brewMethod', recipe.brewMethod ?? '');
                    set('dose', recipe.dose);
                    set('waterMl', recipe.waterMl);
                  }
                }}
                onAdd={() => setShowRecipeForm(true)}
              />
            ) : (
              <div className="card p-4">
                <RecipeForm
                  inline
                  onSubmit={handleRecipeCreate}
                  onCancel={() => setShowRecipeForm(false)}
                  submitLabel="Create Recipe"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <div>
              <label className="label">Dose (g)</label>
              <input
                type="number"
                value={values.dose || ''}
                onChange={(e) => set('dose', Number(e.target.value))}
                placeholder="18"
                className="input"
              />
            </div>
            <div>
              <label className="label">Water (ml)</label>
              <input
                type="number"
                value={values.waterMl || ''}
                onChange={(e) => set('waterMl', Number(e.target.value))}
                placeholder="300"
                className="input"
              />
            </div>
            <div>
              <label className="label">Method</label>
              <select
                value={values.brewMethod}
                onChange={(e) => set('brewMethod', e.target.value)}
                className="input"
              >
                {BREW_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Flavor Notes</label>
            <TagInput
              value={values.flavorNotes ?? []}
              onChange={(tags) => set('flavorNotes', tags)}
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <input
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Recipe tweaks, observations…"
              className="input"
            />
          </div>

          <div>
            <label className="label">Rating</label>
            <StarRating
              value={values.rating}
              onChange={(v) => set('rating', v)}
            />
          </div>

          <div>
            <label className="label">Photo</label>
            {values.photoUrl ? (
              <div className="relative">
                <img
                  src={values.photoUrl}
                  alt="Entry photo"
                  className="rounded-lg w-full object-cover"
                  style={{ maxHeight: 200 }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  style={{ background: 'var(--bg)' }}
                  onClick={() => set('photoUrl', undefined)}
                  className="absolute top-2 right-2"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label
                className="flex items-center justify-center gap-2 rounded-lg cursor-pointer text-sm transition-colors"
                style={{
                  border: '1px dashed var(--border)',
                  color: 'var(--text-muted)',
                  padding: '20px 0',
                }}
              >
                <AddPhotoAlternateIcon sx={{ fontSize: 18 }} />
                {uploading ? 'Uploading…' : 'Add photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </>
      )}
      <div className="flex gap-3 pt-2">
        {(coffeeId || (roasterConfirmed && values.coffee.trim())) && (
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {submitLabel}
          </Button>
        )}
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
