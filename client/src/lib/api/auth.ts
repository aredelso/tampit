import { request, json } from './request';

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  photo: string | null;
  roasterId: number | null;
  userType: 'STANDARD' | 'ROASTER';
};

export type AuthResponse = { token: string; user: AuthUser };

export const auth = {
  register: ({
    name,
    email,
    password,
    userType = 'STANDARD',
    roasterId,
  }: {
    name?: string;
    email: string;
    password: string;
    userType?: 'STANDARD' | 'ROASTER';
    roasterId?: number | null;
  }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      ...json({ name, email, password, userType, roasterId }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      ...json({ email, password }),
    }),
  verifyEmail: (token: string) =>
    request<{ success: boolean; email: string }>('/auth/verify-email', {
      method: 'POST',
      ...json({ token }),
    }),
  unverifyEmail: (email: string) =>
    request<{ success: boolean; email: string }>('/auth/unverify-email', {
      method: 'POST',
      ...json({ email }),
    }),
  sendVerificationEmail: (email: string) =>
    request<void>('/auth/send-verification-email', {
      method: 'POST',
      ...json({ email }),
    }),
  googleAuth: (idToken: string) =>
    request<AuthResponse>('/auth/google', {
      method: 'POST',
      ...json({ idToken }),
    }),
};
