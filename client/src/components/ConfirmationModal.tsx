'use client';

import { Button } from './Button';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import { ReactNode } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    danger: ErrorIcon,
    warning: WarningIcon,
    info: InfoIcon,
  };

  const IconComponent = iconMap[variant];

  const colorMap = {
    danger: 'var(--accent)',
    warning: 'var(--accent)',
    info: 'var(--accent)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl pointer-events-auto bg-white dark:bg-gray-800 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0" style={{ color: colorMap[variant] }}>
            <IconComponent sx={{ fontSize: 24 }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text-h)' }}
            >
              {title}
            </h2>
            <div
              className="text-sm mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {message}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
            disabled={isLoading}
            style={{ background: colorMap[variant] }}
          >
            {isLoading ? 'Loading…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
