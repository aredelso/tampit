import { Module, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
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
import { WishlistModule } from './wishlist/wishlist.module';
import { RecipesModule } from './recipes/recipes.module';
import { FollowsModule } from './follows/follows.module';
import { EmailModule } from './email/email.module';
import { InventoryModule } from './inventory/inventory.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['src/**/*.gql'],
      context: ({ req }: any) => ({ req }),
    }),
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
    WishlistModule,
    RecipesModule,
    FollowsModule,
    EmailModule,
    InventoryModule,
    AiModule,
  ],
})
/**
 * Root module. Wires every feature module together and, on boot, makes sure the
 * dev login account exists.
 */
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  /** Runs once the app has started. Creates the dev user if it is missing. */
  async onApplicationBootstrap() {
    // Dev login account is only created when its credentials are configured.
    const devEmail = process.env.DEV_USER_EMAIL;
    const devPassword = process.env.DEV_USER_PASSWORD;
    if (!devEmail || !devPassword) return;

    const exists = await this.prisma.user.findUnique({
      where: { email: devEmail },
    });
    if (!exists) {
      await this.prisma.user.create({
        data: {
          email: devEmail,
          passwordHash: await bcrypt.hash(devPassword, 10),
          name: 'Dev',
        },
      });
    }
  }
}
