import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: { name?: string; email?: string; password?: string }) {
    if (!body.email || !body.password)
      throw new BadRequestException('email and password required');
    return this.auth.register(body.name, body.email, body.password);
  }

  @Post('login')
  login(@Body() body: { email?: string; password?: string }) {
    if (!body.email || !body.password)
      throw new BadRequestException('email and password required');
    return this.auth.login(body.email, body.password);
  }
}
