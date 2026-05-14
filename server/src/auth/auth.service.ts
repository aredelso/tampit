import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(name: string | undefined, email: string, password: string) {
    const passwordHash = await bcrypt.hash(String(password), 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          name: name ? String(name) : null,
          email: String(email),
          passwordHash,
        },
      });
      const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          photo: user.photo ?? null,
        },
      };
    } catch (err: any) {
      if (err?.code === 'P2002')
        throw new ConflictException('Email already in use');
      throw err;
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: String(email) },
    });
    if (!user?.passwordHash)
      throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
      },
    };
  }
}
