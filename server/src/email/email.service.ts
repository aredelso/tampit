import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly prisma: PrismaService) {
    const smtpHost = process.env.SMTP_HOST || 'localhost';
    const smtpPort = parseInt(process.env.SMTP_PORT || '1025', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const config: any = {
      host: smtpHost,
      port: smtpPort,
    };

    if (smtpUser && smtpPass) {
      config.auth = { user: smtpUser, pass: smtpPass };
    }

    this.transporter = nodemailer.createTransport(config);
  }

  async sendVerificationEmail(email: string, appUrl: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.verificationToken.create({
      data: {
        token,
        email,
        expiresAt,
      },
    });

    const verificationLink = `${appUrl}/verify-email?token=${token}`;

    console.log(
      `Sending verification email to ${email} with link: ${verificationLink}`
    );

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@tampit.local',
      to: email,
      subject: 'Verify your TampIt email',
      html: `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link expires in 24 hours.</p>
      `,
      text: `Verify your email: ${verificationLink}`,
    });

    return token;
  }

  async verifyToken(token: string): Promise<string | null> {
    const verification = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verification) return null;
    if (verification.expiresAt < new Date()) {
      await this.prisma.verificationToken.delete({ where: { token } });
      return null;
    }

    await this.prisma.verificationToken.delete({ where: { token } });
    return verification.email;
  }
}
