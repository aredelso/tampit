'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import type { Coffee } from '@shared/coffee';
import { api } from '@/lib/api';
import { uploadPhoto } from '@/lib/api/uploads';
import { useRoasters } from '../hooks/useRoasters';
import { useExtractCoffeeData } from '../hooks/useExtractCoffeeData';
import { Button } from './Button';
import { Combobox } from './Combobox';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';

export type CoffeeFormData = {
  roasterId: number;
  name: string;
  origin?: string;
  variety?: string;
  farm?: string;
  process?: string;
  description?: string;
  photoUrl?: string;
};

const DEFAULTS: Omit<CoffeeFormData, 'roasterId'> = {
  name: '',
  origin: '',
  variety: '',
  farm: '',
  process: '',
  description: '',
  photoUrl: undefined,
};

interface Props {
  roasterId?: number;
  initialValues?: Partial<CoffeeFormData>;
  onSubmit: (data: CoffeeFormData) => Promise<boolean>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function CoffeeForm({
  roasterId: lockedRoasterId,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Add Coffee',
}: Props) {
  const { roasters } = useRoasters();
  const {
    loading: extracting,
    error: extractError,
    extract,
  } = useExtractCoffeeData();
  const [roasterName, setRoasterName] = useState('');
  const [values, setValues] = useState({ ...DEFAULTS, ...initialValues });
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues({ ...DEFAULTS, ...initialValues });
  }, [initialValues]);

  function set<K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K]
  ) {
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

  async function handleAIExtraction(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const extracted = await extract(file);
    if (!extracted) return;

    // Pre-fill form fields with extracted data
    if (extracted.name) set('name', extracted.name);
    if (extracted.origin) set('origin', extracted.origin);
    if (extracted.variety) set('variety', extracted.variety);
    if (extracted.farm) set('farm', extracted.farm);
    if (extracted.process) set('process', extracted.process);
    if (extracted.description) set('description', extracted.description);
    if (extracted.roasterName) setRoasterName(extracted.roasterName);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const roasterId =
      lockedRoasterId ??
      roasters.find((r) => r.name.toLowerCase() === roasterName.toLowerCase())
        ?.id;
    if (!roasterId) return;
    setIsSubmitting(true);
    try {
      const ok = await onSubmit({ roasterId, ...values });
      if (ok) {
        setValues(DEFAULTS);
        setRoasterName('');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const roasterOptions = roasters
    .filter((r) => r.name.toLowerCase().includes(roasterName.toLowerCase()))
    .map((r) => ({ label: r.name }));

  const resolvedRoasterId =
    lockedRoasterId ??
    roasters.find((r) => r.name.toLowerCase() === roasterName.toLowerCase())
      ?.id;

  const { data: existingCoffees = [] } = useSWR<Coffee[]>(
    resolvedRoasterId ? `/coffees?roasterId=${resolvedRoasterId}` : null,
    () => api.coffees.list(resolvedRoasterId)
  );

  const nameTrimmed = values.name.trim();
  const duplicate =
    nameTrimmed.length > 0 &&
    existingCoffees.some(
      (c) => c.name.toLowerCase() === nameTrimmed.toLowerCase()
    );

  const canSubmit = nameTrimmed.length > 0 && !!resolvedRoasterId && !duplicate;

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {!lockedRoasterId && (
        <div>
          <label className="label">Roaster</label>
          <Combobox
            value={roasterName}
            onChange={setRoasterName}
            options={roasterOptions}
            placeholder="e.g. Blue Bottle"
            minChars={1}
          />
        </div>
      )}

      <div>
        <label className="label">Name</label>
        <input
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Ethiopia Yirgacheffe"
          className="input"
          required
          autoFocus={!!lockedRoasterId}
        />
        {duplicate && (
          <p
            className="mt-1 text-xs"
            style={{ color: 'var(--error, #e53e3e)' }}
          >
            A coffee with this name already exists for this roaster.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="label">Origin</label>
          <input
            value={values.origin}
            onChange={(e) => set('origin', e.target.value)}
            placeholder="e.g. Ethiopia"
            className="input"
          />
        </div>
        <div>
          <label className="label">Variety</label>
          <input
            value={values.variety}
            onChange={(e) => set('variety', e.target.value)}
            placeholder="e.g. Bourbon"
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="label">Farm</label>
          <input
            value={values.farm}
            onChange={(e) => set('farm', e.target.value)}
            placeholder="e.g. Yirgacheffe Cooperative"
            className="input"
          />
        </div>
        <div>
          <label className="label">Process</label>
          <input
            value={values.process}
            onChange={(e) => set('process', e.target.value)}
            placeholder="e.g. Washed"
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Tasting notes, background, what makes this coffee special…"
          className="input"
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div>
        <label className="label">Extract from bag image</label>
        <p
          className="text-xs"
          style={{ color: 'var(--text-muted)', marginBottom: 12 }}
        >
          Upload a photo of a coffee bag label to automatically fill in the
          details.
        </p>
        <label
          className="flex items-center justify-center gap-2 rounded-lg cursor-pointer text-sm transition-colors"
          style={{
            border: '1px dashed var(--border)',
            color: 'var(--text-muted)',
            padding: '20px 0',
            opacity: extracting ? 0.6 : 1,
            pointerEvents: extracting ? 'none' : 'auto',
          }}
        >
          <ImageSearchIcon sx={{ fontSize: 18 }} />
          {extracting ? 'Analyzing image…' : 'Extract from image'}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleAIExtraction}
            disabled={extracting}
          />
        </label>
        {extractError && (
          <p
            className="mt-2 text-xs"
            style={{ color: 'var(--error, #e53e3e)' }}
          >
            {extractError}
          </p>
        )}
      </div>

      <div>
        <label className="label">Photo</label>
        {values.photoUrl ? (
          <div className="relative">
            <img
              src={values.photoUrl}
              alt="Coffee photo"
              className="rounded-lg w-full object-cover"
              style={{ maxHeight: 200 }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
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

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={!canSubmit}
          loading={isSubmitting}
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
