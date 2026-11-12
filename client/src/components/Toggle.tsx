interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        {label && <p className="text-sm font-medium">{label}</p>}
        {description && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        style={{
          background: checked ? 'var(--accent)' : 'var(--bg-subtle)',
        }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          style={{
            transform: checked ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
          }}
        />
      </button>
    </div>
  );
}
