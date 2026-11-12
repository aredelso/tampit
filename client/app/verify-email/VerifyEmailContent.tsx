'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/Button';
import Link from 'next/link';

type VerificationState = 'loading' | 'success' | 'error';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerificationState>('loading');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMessage('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await api.auth.verifyEmail(token);
        setEmail(result.email);
        setState('success');
      } catch (error) {
        setState('error');
        if (error instanceof Error) {
          try {
            const errorData = JSON.parse(error.message);
            if (
              errorData.message === 'Invalid or expired token' ||
              errorData.message === 'User not found'
            ) {
              setErrorMessage(
                'This verification link is invalid or has expired. Please register again.'
              );
            } else {
              setErrorMessage(errorData.message || 'Verification failed');
            }
          } catch {
            setErrorMessage('Verification failed. Please try again.');
          }
        }
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="w-full max-w-sm mx-auto mt-8 sm:mt-16">
      <div className="card p-8 flex flex-col gap-6">
        {state === 'loading' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-transparent border-t-[var(--brand)] rounded-full animate-spin" />
            </div>
            <p className="text-lg font-medium">Verifying your email...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait while we confirm your email address.
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg font-medium">Email verified!</p>
            <p className="text-sm text-muted-foreground mt-2">
              {email && `You've successfully verified ${email}.`}
              {!email && "You've successfully verified your email."}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              You can now sign in with your account.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/login">
                <Button variant="primary" fullWidth>
                  Go to Sign In
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" fullWidth>
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg font-medium">Verification failed</p>
            <p className="text-sm text-red-600 mt-3">{errorMessage}</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/login">
                <Button variant="primary" fullWidth>
                  Back to Sign In
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" fullWidth>
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
