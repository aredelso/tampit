'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useUser } from '@/context/UserContext';

export enum AuthError {
  INCORRECT_CREDENTIALS = 0,
  EMAIL_NOT_VERIFIED,
}

export function useAuth() {
  const router = useRouter();
  const { login: contextLogin, logout: contextLogout } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const register = async (params: {
    name?: string;
    email: string;
    password: string;
    userType?: 'STANDARD' | 'ROASTER';
    roasterId?: number | null;
  }) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.register(params);
      contextLogin(res.token, res.user);
      return res;
    } catch {
      setError('Registration failed. Email may already be in use.');
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.login(email, password);
      contextLogin(res.token, res.user);
      router.push('/');
      return res;
    } catch (error: unknown) {
      // The request helper throws Error(JSON.stringify(body)) for HTTP errors,
      // so the server's message can be read from error.message.
      let errorMessage = 'Invalid email or password.';
      let authError = AuthError.INCORRECT_CREDENTIALS;

      if (error instanceof Error) {
        let serverMessage: string | undefined;
        try {
          const errorData = JSON.parse(error.message);
          serverMessage = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message;
        } catch {
          // Not a JSON body: the request never got an HTTP error response.
          // fetch() rejects with a TypeError when the server is unreachable.
          errorMessage =
            'Could not reach the server. Check that the app is running and try again.';
          setError(errorMessage);
          setAuthError(AuthError.INCORRECT_CREDENTIALS);
          throw new Error('Login failed', { cause: error });
        }

        if (serverMessage === 'Email not verified') {
          errorMessage =
            'Please verify your email before signing in. Check your inbox for a verification link.';
          authError = AuthError.EMAIL_NOT_VERIFIED;
        } else if (serverMessage && serverMessage !== 'Invalid credentials') {
          // Show any other server message (e.g. validation errors) as-is.
          errorMessage = serverMessage;
        }
      }

      setError(errorMessage);
      setAuthError(authError);
      throw new Error('Login failed', { cause: error });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    contextLogout();
    router.push('/');
  };

  const sendVerificationEmail = async (email: string) => {
    setLoading(true);
    setError('');
    try {
      await api.auth.sendVerificationEmail(email);
    } catch {
      setError('Failed to send verification email. Please try again later.');
      throw new Error('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.googleAuth(idToken);
      contextLogin(res.token, res.user);
      router.push('/');
      return res;
    } catch {
      setError('Google sign in failed. Please try again.');
      throw new Error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    login,
    logout,
    loading,
    error,
    setError,
    authError,
    setAuthError,
    sendVerificationEmail,
    googleLogin,
  };
}
