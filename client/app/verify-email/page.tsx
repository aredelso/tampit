'use client';

import { Suspense } from 'react';
import VerifyEmailContent from './VerifyEmailContent';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm mx-auto mt-8 sm:mt-16">
          <div className="card p-8 flex flex-col gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-transparent border-t-[var(--brand)] rounded-full animate-spin" />
              </div>
              <p className="text-lg font-medium">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
