import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';

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
