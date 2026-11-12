import { ReactNode } from 'react';

interface Tab<T> {
  key: T;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps<T> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: TabsProps<T>) {
  return (
    <div className="flex gap-1 pb-2">
      {tabs.map(({ key, label, count, icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className="relative px-4 pb-3 text-sm font-medium transition-colors flex items-center gap-2"
            style={{
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {icon && (
              <span className="flex items-center justify-center">{icon}</span>
            )}
            {label}
            {count != null && count > 0 && (
              <span
                className="ml-1.5 text-xs rounded-full px-1.75 py-0.5"
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
              style={{
                background: active ? 'var(--accent)' : 'transparent',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
