import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(
    @Body()
    body: {
      name?: string;
      email?: string;
      password?: string;
      userType?: 'STANDARD' | 'ROASTER';
      roasterId?: number | null;
    }
  ) {
    if (!body.email || !body.password)
      throw new BadRequestException('email and password required');
    return this.auth.register(
      body.name,
      body.email,
      body.password,
      body.userType ?? 'STANDARD',
      body.roasterId
    );
  }

  @Post('login')
  login(@Body() body: { email?: string; password?: string }) {
    if (!body.email || !body.password)
      throw new BadRequestException('email and password required');
    return this.auth.login(body.email, body.password);
  }

  @Post('send-verification-email')
  sendVerificationEmail(@Body() body: { email?: string }) {
    if (!body.email) throw new BadRequestException('email required');
    return this.auth.sendVerificationEmail(body.email);
  }

  @Post('verify-email')
  verifyEmail(@Body() body: { token?: string }) {
    if (!body.token) throw new BadRequestException('token required');
    return this.auth.verifyEmail(body.token);
  }

  @Post('unverify-email')
  unverifyEmail(@Body() body: { email?: string }) {
    if (!body.email) throw new BadRequestException('email required');
    return this.auth.unverifyEmail(body.email);
  }

  @Post('google')
  googleAuth(@Body() body: { idToken?: string }) {
    if (!body.idToken) throw new BadRequestException('idToken required');
    return this.auth.googleAuth(body.idToken);
  }
}
