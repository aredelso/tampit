import { Module, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { WsModule } from './ws/ws.module';
import { AuthModule } from './auth/auth.module';
import { EntriesModule } from './entries/entries.module';
import { UsersModule } from './users/users.module';
import { RoastersModule } from './roasters/roasters.module';
import { SeedModule } from './seed/seed.module';
import { UploadsModule } from './uploads/uploads.module';
import { CoffeesModule } from './coffees/coffees.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    PrismaModule,
    WsModule,
    AuthModule,
    EntriesModule,
    UsersModule,
    RoastersModule,
    SeedModule,
    UploadsModule,
    CoffeesModule,
    TagsModule,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    const exists = await this.prisma.user.findUnique({
      where: { email: 'dev@dev.com' },
    });
    if (!exists) {
      await this.prisma.user.create({
        data: {
          email: 'dev@dev.com',
          passwordHash: await bcrypt.hash('password', 10),
          name: 'Dev',
        },
      });
    }
  }
}
