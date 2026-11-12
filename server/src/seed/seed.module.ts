import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SeedController } from './seed.controller';

/**
 * Dev seeding feature. Imports AuthModule because the seed controller signs the
 * dev user in after seeding (it needs AuthService).
 */
@Module({
  imports: [AuthModule],
  controllers: [SeedController],
})
export class SeedModule {}
