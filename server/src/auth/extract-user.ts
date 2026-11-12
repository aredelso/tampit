import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { requireEnv } from '../config/env';

// Must match the secret used by AuthService when signing tokens, or every
// token will fail verification.
const JWT_SECRET = requireEnv('JWT_SECRET');

export type TokenPayload = {
  userId: string;
  email?: string;
  name?: string;
  roasterId?: number | null;
  userType?: 'STANDARD' | 'ROASTER';
};

export function extractUserId(req: Request): string {
  const payload = extractToken(req);
  return payload.userId;
}

export function extractToken(req: Request): TokenPayload {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer '))
    throw new UnauthorizedException('Missing token');
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as TokenPayload;
    return payload;
  } catch {
    throw new UnauthorizedException('Invalid token');
  }
}
