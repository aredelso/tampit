import { request } from './request';
import type { AuthResponse } from './auth';

/**
 * Response from POST /dev/seed: the seed summary message plus a login session
 * (token and user) for the dev account.
 */
export type SeedResponse = AuthResponse & { message: string };

export const dev = {
  seed: () => request<SeedResponse>('/dev/seed', { method: 'POST' }),
};
