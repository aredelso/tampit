'use client';

import { useState } from 'react';
import { AuthError, useAuth } from '@/hooks/useAuth';
import { RoasterCombobox } from '@/components/RoasterCombobox';
import { ComboboxOption } from '@/components/Combobox';
import { Toggle } from '@/components/Toggle';
import { Button } from '@/components/Button';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { useRoasters } from '@/hooks/useRoasters';
import { api } from '@/lib/api';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const {
    login: authLogin,
    register: authRegister,
    loading,
    error,
    setError,
    authError,
    setAuthError,
    sendVerificationEmail,
    googleLogin,
  } = useAuth();
  const { addRoaster } = useRoasters();
  const [mode, setMode] = useState<Mode>('login');
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [roasterId, setRoasterId] = useState<number | null>(null);
  const [roasterConfirmed, setRoasterConfirmed] = useState(false);
  const [isNewRoaster, setIsNewRoaster] = useState(false);
  const [location, setLocation] = useState('');
  const [accountType, setAccountType] = useState<'STANDARD' | 'ROASTER'>(
    'STANDARD'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyEmailSent, setVerifyEmailSent] = useState(false);
  const [unverifyLoading, setUnverifyLoading] = useState(false);

  async function handleUnverify() {
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    setUnverifyLoading(true);
    setError('');
    try {
      await api.auth.unverifyEmail(email);
      alert(`Email ${email} has been unverified for testing.`);
    } catch {
      setError('Failed to unverify email');
    } finally {
      setUnverifyLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await authLogin(email, password);
      } else {
        const registerPayload = {
          name,
          email,
          password,
          userType: accountType,
          roasterId,
        };
        if (accountType === 'ROASTER' && isNewRoaster) {
          const newRoaster = await addRoaster({
            name: query.trim(),
            location: location || undefined,
          });
          registerPayload.roasterId = newRoaster.id;
        }
        await authRegister(registerPayload);
        setVerifyEmailSent(true);
      }
    } catch {
      // Error is already set in the hook
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-4 sm:mt-8">
      <div className="card p-6 flex flex-col gap-6">
        {verifyEmailSent ? (
          <div className="text-center">
            <p className="text-lg font-medium">Check your email</p>
            <p className="text-muted-foreground">
              We've sent a verification link to your email.
            </p>
            {accountType === 'ROASTER' && (
              <p className="text-sm text-muted-foreground mt-4">
                Someone from our team may reach out to verify your roaster
                account before you can access roaster features. This usually
                takes 1-2 business days.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Tab switcher */}
            <div
              className="flex gap-1 p-1 rounded-lg"
              style={{ background: 'var(--bg-subtle)' }}
            >
              {(['login', 'register'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError('');
                  }}
                  className="flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
                  style={
                    mode === m
                      ? {
                          background: 'var(--bg-card)',
                          color: 'var(--text-h)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          border: 'none',
                          cursor: 'pointer',
                        }
                      : {
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          border: 'none',
                          cursor: 'pointer',
                        }
                  }
                >
                  {m === 'login' ? 'Sign in' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {mode === 'register' && (
                <>
                  <div className="pt-2 pb-3">
                    <Toggle
                      checked={accountType === 'ROASTER'}
                      onChange={(checked) =>
                        setAccountType(checked ? 'ROASTER' : 'STANDARD')
                      }
                      label="Register as roaster"
                      description="Roasters can manage their coffees and profile"
                    />
                  </div>
                  {accountType === 'ROASTER' ? (
                    <>
                      <div>
                        <label className="label">Roaster</label>
                        <RoasterCombobox
                          value={query}
                          onChange={(v) => {
                            setQuery(v);
                            if (!v.trim()) setRoasterConfirmed(false);
                          }}
                          onSelect={({ data }: ComboboxOption) =>
                            setRoasterId((data as { value: number }).value)
                          }
                          onConfirm={(isNew) => {
                            setRoasterConfirmed(true);
                            if (isNew) setIsNewRoaster(true);
                          }}
                        />
                      </div>
                      {isNewRoaster && (
                        <div>
                          <label className="label">Location</label>
                          <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="eg. Seattle, WA"
                            className="input"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <label className="label">Name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="input"
                      />
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input"
                />
              </div>

              {error && (
                <p className="text-sm" style={{ color: '#b91c1c', margin: 0 }}>
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                fullWidth
                loading={loading}
                className="mt-1"
              >
                {!loading && (
                  <>{mode === 'login' ? 'Sign in' : 'Create account'}</>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => {
                  if (authError === AuthError.EMAIL_NOT_VERIFIED) {
                    sendVerificationEmail(email);
                    setAuthError(null);
                  } else {
                    // Forgot password logic here (not implemented)
                    alert(
                      'Forgot password functionality is not implemented yet.'
                    );
                  }
                }}
              >
                {authError === AuthError.EMAIL_NOT_VERIFIED
                  ? 'Resend verification email'
                  : 'Forgot password?'}
              </Button>
              {mode === 'login' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth
                  loading={unverifyLoading}
                  disabled={!email || unverifyLoading}
                  onClick={handleUnverify}
                  className="text-xs opacity-60 hover:opacity-100"
                >
                  {!unverifyLoading && 'Test: Unverify email'}
                </Button>
              )}
            </form>
            <div className="flex items-center gap-3 my-4">
              <div
                className="flex-1 h-px"
                style={{ background: 'var(--border)' }}
              />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                or
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: 'var(--border)' }}
              />
            </div>
            <GoogleSignInButton
              onSuccess={(credential) => googleLogin(credential)}
              onError={() => setError('Google sign in failed')}
            />
          </>
        )}
      </div>
    </div>
  );
}
