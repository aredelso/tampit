'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRef, useEffect } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: () => void;
}

let gsiInitialized = false;

export function GoogleSignInButton({
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      gsiInitialized = true;
    }
  }, []);

  // Suppress GSI multiple initialization warning in development
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    const suppressGsiWarning = (message: string) => {
      if (
        typeof message === 'string' &&
        message.includes('google.accounts.id.initialize')
      ) {
        return;
      }
      return true;
    };

    console.error = (...args) => {
      if (suppressGsiWarning(String(args[0]))) {
        originalConsoleError(...args);
      }
    };

    console.warn = (...args) => {
      if (suppressGsiWarning(String(args[0]))) {
        originalConsoleWarn(...args);
      }
    };

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  return (
    <GoogleLogin
      onSuccess={(cred: CredentialResponse) => {
        if (cred.credential) {
          onSuccess(cred.credential);
        }
      }}
      onError={() => {
        if (onError) onError();
      }}
      text="continue_with"
    />
  );
}
