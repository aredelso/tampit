'use client';

import { useState } from 'react';
import type { RecipePayload, RecipePhase } from '@/lib/api/recipes';
import { Button } from './Button';

export type RecipeFormData = Omit<RecipePayload, never>;

export function RecipeForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create',
  inline = false,
}: {
  initialValues?: RecipePayload;
  onSubmit: (data: RecipeFormData) => Promise<boolean>;
  onCancel: () => void;
  submitLabel?: string;
  inline?: boolean;
}) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [brewMethod, setBrewMethod] = useState(initialValues?.brewMethod ?? '');
  const [grindSize, setGrindSize] = useState(initialValues?.grindSize ?? '');
  const [grindSizeType, setGrindSizeType] = useState<'standard' | 'microns'>(
    initialValues?.grindSize && !isNaN(Number(initialValues.grindSize))
      ? 'microns'
      : 'standard'
  );
  const [phases, setPhases] = useState<RecipePhase[]>(
    initialValues?.phases ?? [{ name: '', waterTemp: 0, waterAmount: 0 }]
  );
  const [brewTime, setBrewTime] = useState(
    initialValues?.brewTime?.toString() ?? ''
  );
  const [dose, setdose] = useState(initialValues?.dose?.toString() ?? '');
  const [waterMl, setWaterMl] = useState(
    initialValues?.waterMl?.toString() ?? ''
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [loading, setLoading] = useState(false);

  const handlePhaseChange = (
    index: number,
    field: keyof RecipePhase,
    value: string | number
  ) => {
    const updated = [...phases];
    if (
      field === 'waterTemp' ||
      field === 'waterAmount' ||
      field === 'startTime'
    ) {
      updated[index] = { ...updated[index], [field]: Number(value) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPhases(updated);
  };

  const addPhase = () => {
    setPhases([...phases, { name: '', waterTemp: 0, waterAmount: 0 }]);
  };

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await onSubmit({
      title,
      description: description || undefined,
      brewMethod: brewMethod || undefined,
      grindSize: grindSize || undefined,
      phases,
      brewTime: brewTime ? Number(brewTime) : undefined,
      dose: dose ? Number(dose) : undefined,
      waterMl: waterMl ? Number(waterMl) : undefined,
      notes: notes || undefined,
    });
    if (success) {
      onCancel();
    }
    setLoading(false);
  };

  const hasValidPhases = phases.every((p) => p.name.trim());

  const totalWaterAmount = phases.reduce(
    (sum, p) => sum + (p.waterAmount || 0),
    0
  );

  const formContent = (
    <>
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-h)' }}
        >
          Recipe Title *
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-h)',
          }}
          placeholder="e.g., Classic Pour Over"
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-h)' }}
        >
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-h)',
          }}
          placeholder="Brief description of the recipe"
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-h)' }}
        >
          Brew Method
        </label>
        <input
          type="text"
          value={brewMethod}
          onChange={(e) => setBrewMethod(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-h)',
          }}
          placeholder="e.g., Pour Over, French Press, AeroPress"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label
            className="block text-sm font-medium"
            style={{ color: 'var(--text-h)' }}
          >
            Grind Size
          </label>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium"
              style={{
                color:
                  grindSizeType === 'standard'
                    ? 'var(--accent)'
                    : 'var(--text-muted)',
              }}
            >
              Standard
            </span>
            <button
              type="button"
              onClick={() => {
                setGrindSizeType(
                  grindSizeType === 'standard' ? 'microns' : 'standard'
                );
                setGrindSize('');
              }}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                background:
                  grindSizeType === 'microns'
                    ? 'var(--accent)'
                    : 'var(--bg-subtle)',
              }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                style={{
                  transform:
                    grindSizeType === 'microns'
                      ? 'translateX(22px)'
                      : 'translateX(2px)',
                }}
              />
            </button>
            <span
              className="text-xs font-medium"
              style={{
                color:
                  grindSizeType === 'microns'
                    ? 'var(--accent)'
                    : 'var(--text-muted)',
              }}
            >
              Microns (µm)
            </span>
          </div>
        </div>

        {grindSizeType === 'standard' ? (
          <select
            value={grindSize}
            onChange={(e) => setGrindSize(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-h)',
            }}
          >
            <option value="">Select a grind size</option>
            {[
              'Extra Coarse',
              'Coarse',
              'Medium Coarse',
              'Medium',
              'Medium Fine',
              'Fine',
              'Extra Fine',
            ].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            value={grindSize}
            onChange={(e) => setGrindSize(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-h)',
            }}
            placeholder="e.g., 200"
          />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className="block text-sm font-medium"
            style={{ color: 'var(--text-h)' }}
          >
            Phases *
          </label>
          <button
            type="button"
            onClick={addPhase}
            className="text-xs rounded px-2 py-1 transition-colors"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-h)',
            }}
          >
            + Add Phase
          </button>
        </div>
        <div className="space-y-3">
          {phases.map((phase, idx) => (
            <div
              key={idx}
              className="rounded-lg p-3"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-h)' }}
                >
                  Phase {idx + 1}
                </span>
                {phases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhase(idx)}
                    className="text-xs rounded px-2 py-1 transition-colors"
                    style={{
                      background: 'rgba(225, 29, 72, 0.1)',
                      color: 'var(--error, #e11d48)',
                      border: '1px solid var(--error, #e11d48)',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Phase Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={phase.name}
                    onChange={(e) =>
                      handlePhaseChange(idx, 'name', e.target.value)
                    }
                    className="w-full rounded px-2 py-1.5 text-sm outline-none"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-h)',
                    }}
                    placeholder="e.g., Bloom"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Start Time (s)
                  </label>
                  <input
                    type="number"
                    value={phase.startTime ?? ''}
                    onChange={(e) =>
                      handlePhaseChange(idx, 'startTime', e.target.value)
                    }
                    className="w-full rounded px-2 py-1.5 text-sm outline-none"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-h)',
                    }}
                    placeholder="e.g., 0"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Water Temp (°C) *
                  </label>
                  <input
                    type="number"
                    required
                    value={phase.waterTemp}
                    onChange={(e) =>
                      handlePhaseChange(idx, 'waterTemp', e.target.value)
                    }
                    className="w-full rounded px-2 py-1.5 text-sm outline-none"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-h)',
                    }}
                    placeholder="e.g., 195"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Water Amount (ml) *
                  </label>
                  <input
                    type="number"
                    required
                    value={phase.waterAmount}
                    onChange={(e) =>
                      handlePhaseChange(idx, 'waterAmount', e.target.value)
                    }
                    className="w-full rounded px-2 py-1.5 text-sm outline-none"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-h)',
                    }}
                    placeholder="e.g., 50"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Notes
                </label>
                <input
                  type="text"
                  value={phase.notes ?? ''}
                  onChange={(e) =>
                    handlePhaseChange(idx, 'notes', e.target.value)
                  }
                  className="w-full rounded px-2 py-1.5 text-sm outline-none"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-h)',
                  }}
                  placeholder="Optional notes for this phase"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-h)' }}
          >
            Total Brew Time (seconds)
          </label>
          <input
            type="number"
            value={brewTime}
            onChange={(e) => setBrewTime(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-h)',
            }}
            placeholder="e.g., 180"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-h)' }}
          >
            Coffee Dose (grams)
          </label>
          <input
            type="number"
            value={dose}
            onChange={(e) => setdose(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-h)',
            }}
            placeholder="e.g., 20"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-h)' }}
          >
            Total Water (ml)
          </label>
          <input
            type="number"
            value={waterMl}
            onChange={(e) => setWaterMl(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-h)',
            }}
            placeholder={
              totalWaterAmount ? `e.g., ${totalWaterAmount}` : 'e.g., 300'
            }
          />
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-h)' }}
        >
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-h)',
            height: '80px',
          }}
          placeholder="Additional notes or tips"
        />
      </div>

      {!inline && (
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={!title.trim() || !hasValidPhases}
            loading={loading}
            variant="primary"
            size="md"
          >
            {submitLabel}
          </Button>
          <Button type="button" onClick={onCancel} variant="ghost" size="md">
            Cancel
          </Button>
        </div>
      )}
    </>
  );

  return inline ? (
    <div className="card p-6 space-y-4">{formContent}</div>
  ) : (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      {formContent}
    </form>
  );
}
