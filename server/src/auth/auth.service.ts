import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService
  ) {}

  async register(
    name: string | undefined,
    email: string,
    password: string,
    userType: 'STANDARD' | 'ROASTER' = 'STANDARD',
    roasterId?: number | null
  ) {
    const passwordHash = await bcrypt.hash(String(password), 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          name: name ? String(name) : null,
          email: String(email),
          passwordHash,
          userType,
          roasterId: roasterId ?? undefined,
        },
        select: {
          id: true,
          email: true,
          name: true,
          photo: true,
          roasterId: true,
          userType: true,
        },
      });

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      if (user.email) {
        const shouldSendVerification = await this.shouldSendVerificationEmail(
          user.email,
          userType,
          roasterId ?? undefined
        );
        if (shouldSendVerification) {
          await this.email.sendVerificationEmail(user.email, appUrl);
        }
      }

      const token = jwt.sign(
        {
          userId: user.id,
          roasterId: user.roasterId,
          email: user.email,
          name: user.name,
          userType: user.userType,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roasterId: user.roasterId,
          photo: user.photo ?? null,
          userType: user.userType,
        },
      };
    } catch (err: any) {
      if (err?.code === 'P2002')
        throw new ConflictException('Email already in use');
      throw err;
    }
  }

  private async shouldSendVerificationEmail(
    email: string,
    userType: 'STANDARD' | 'ROASTER',
    roasterId?: number
  ): Promise<boolean> {
    // Always send for standard users
    if (userType === 'STANDARD') return true;

    // For roaster users, only send if email domain matches roaster contact email domain
    if (!roasterId) return true; // Send if no roaster selected (shouldn't happen)

    const roaster = await this.prisma.roaster.findUnique({
      where: { id: roasterId },
      select: { contactEmail: true },
    });

    if (!roaster?.contactEmail) return true; // Send if roaster has no contact email configured

    const emailDomain = email.split('@')[1]?.toLowerCase();
    const roasterDomain = roaster.contactEmail.split('@')[1]?.toLowerCase();

    return emailDomain === roasterDomain;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: String(email) },
      select: {
        id: true,
        email: true,
        name: true,
        photo: true,
        roasterId: true,
        userType: true,
        passwordHash: true,
        verified: true,
      },
    });
    if (!user?.passwordHash)
      throw new UnauthorizedException('Invalid credentials');
    if (!user.verified) throw new UnauthorizedException('Email not verified');
    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const token = jwt.sign(
      {
        userId: user.id,
        roasterId: user.roasterId,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roasterId: user.roasterId,
        photo: user.photo,
        userType: user.userType,
      },
    };
  }

  async sendVerificationEmail(email: string) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    await this.email.sendVerificationEmail(email, appUrl);
  }

  async verifyEmail(token: string) {
    const email = await this.email.verifyToken(token);
    if (!email) throw new BadRequestException('Invalid or expired token');

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new BadRequestException('User not found');

    await this.prisma.user.update({
      where: { email },
      data: { verified: true },
    });

    return { success: true, email };
  }

  async unverifyEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: String(email) },
    });
    if (!user) throw new BadRequestException('User not found');

    await this.prisma.user.update({
      where: { email: String(email) },
      data: { verified: false },
    });

    return { success: true, email };
  }

  async googleAuth(idToken: string) {
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email)
      throw new UnauthorizedException('Invalid Google token');

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: payload.sub }, { email: payload.email }],
      },
      select: {
        id: true,
        email: true,
        name: true,
        photo: true,
        roasterId: true,
        userType: true,
        googleId: true,
      },
    });

    if (user) {
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: payload.sub, verified: true },
          select: {
            id: true,
            email: true,
            name: true,
            photo: true,
            roasterId: true,
            userType: true,
            googleId: true,
          },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name ?? null,
          photo: payload.picture ?? null,
          googleId: payload.sub,
          verified: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          photo: true,
          roasterId: true,
          userType: true,
          googleId: true,
        },
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        roasterId: user.roasterId,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roasterId: user.roasterId,
        photo: user.photo ?? null,
        userType: user.userType,
      },
    };
  }
}
