import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';

export function extractUserId(req: Request): string {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer '))
    throw new UnauthorizedException('Missing token');
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    throw new UnauthorizedException('Invalid token');
  }
}
