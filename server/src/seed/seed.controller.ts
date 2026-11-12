import { Controller, HttpCode, Post } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { requireEnv } from '../config/env';
import { ROASTERS, ENTRIES, RECIPES } from './seed.data';

/**
 * Development-only endpoint that wipes the coffee data and reloads demo data.
 *
 * POST /dev/seed deletes every roaster, user, coffee, entry, recipe and like,
 * then recreates the demo set. Do not expose it in production.
 */
@Controller('dev/seed')
export class SeedController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) {}

  /**
   * Replaces all seed data and returns a login session for the dev user, so the
   * client can sign in without ever holding the dev password.
   */
  @Post()
  @HttpCode(201)
  async seed() {
    // Clear dependent rows first so foreign-key constraints are not violated.
    await this.prisma.commentLike.deleteMany({});
    await this.prisma.comment.deleteMany({});
    await this.prisma.like.deleteMany({});
    await this.prisma.recipeLike.deleteMany({});
    await this.prisma.recipe.deleteMany({});
    await this.prisma.coffeeEntry.deleteMany({});
    await this.prisma.coffee.deleteMany({});
    await this.prisma.roaster.deleteMany({});
    await this.prisma.user.deleteMany({});

    // Create all roasters
    await this.prisma.roaster.createMany({
      data: ROASTERS.map((r: any) => ({
        name: r.name,
        location: r.location ?? null,
        logoUrl: r.logoUrl ?? null,
      })),
      skipDuplicates: true,
    });
    const roasters = await this.prisma.roaster.findMany();
    const roasterByName = Object.fromEntries(
      roasters.map((r: any) => [r.name, r])
    );

    // Users: the dev account's credentials come from env vars, never from source.
    const devEmail = requireEnv('DEV_USER_EMAIL');
    const devPassword = requireEnv('DEV_USER_PASSWORD');
    const devHash = await bcrypt.hash(devPassword, 10);
    const dev = await this.prisma.user.create({
      data: {
        name: 'Dev',
        email: devEmail,
        passwordHash: devHash,
        photo: `https://i.pravatar.cc/150?u=${encodeURIComponent(devEmail)}`,
        userType: 'STANDARD',
        verified: true,
      },
    });
    const alice = await this.prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@example.com',
        photo: 'https://i.pravatar.cc/150?u=alice@example.com',
        userType: 'ROASTER',
        verified: true,
      },
    });
    const bob = await this.prisma.user.create({
      data: {
        name: 'Bob',
        email: 'bob@example.com',
        photo: 'https://i.pravatar.cc/150?u=bob@example.com',
        userType: 'STANDARD',
        verified: true,
      },
    });
    const userByName: Record<string, typeof dev> = { dev, alice, bob };

    // Entries
    const entries = [];
    for (const e of ENTRIES) {
      const roaster = roasterByName[e.roaster];
      if (!roaster) continue;
      const coffee = await this.prisma.coffee.upsert({
        where: { name_roasterId: { name: e.coffee, roasterId: roaster.id } },
        update: {
          process: e.process ?? null,
          description: e.description ?? null,
          photoUrl: e.coffeePhoto ?? null,
          variety: e.variety ?? null,
          farm: e.farm ?? null,
        },
        create: {
          name: e.coffee,
          origin: e.origin,
          variety: e.variety ?? null,
          farm: e.farm ?? null,
          process: e.process ?? null,
          description: e.description ?? null,
          photoUrl: e.coffeePhoto ?? null,
          roasterId: roaster.id,
        },
      });
      const entry = await this.prisma.coffeeEntry.create({
        data: {
          roasterId: roaster.id,
          coffeeId: coffee.id,
          origin: e.origin,
          brewMethod: e.brewMethod,
          dose: e.dose,
          waterMl: e.waterMl,
          notes: e.notes,
          rating: e.rating,
          photoUrl: e.photo
            ? `https://picsum.photos/seed/${e.photo}/800/500`
            : null,
          flavorNotes: e.flavorNotes,
          userId: userByName[e.user].id,
        },
      });
      entries.push(entry);
    }

    // Likes
    const likeTargets = entries.slice(0, 10);
    for (const [i, entry] of likeTargets.entries()) {
      const liker = i % 3 === 0 ? alice : i % 3 === 1 ? bob : dev;
      if (liker.id !== entry.userId) {
        await this.prisma.like.create({
          data: { entryId: entry.id, userId: liker.id },
        });
      }
    }

    // Comments
    await this.prisma.comment.create({
      data: {
        entryId: entries[1].id,
        userId: dev.id,
        content: 'What grind size?',
      },
    });
    await this.prisma.comment.create({
      data: { entryId: entries[1].id, userId: bob.id, content: 'Gorgeous!' },
    });
    await this.prisma.comment.create({
      data: {
        entryId: entries[2].id,
        userId: alice.id,
        content: 'That natural process 🤌',
      },
    });
    await this.prisma.comment.create({
      data: {
        entryId: entries[5].id,
        userId: alice.id,
        content: 'Tim Wendelboe never misses',
      },
    });

    // Recipes
    const recipes = [];
    for (const r of RECIPES) {
      const recipe = await this.prisma.recipe.create({
        data: {
          title: r.title,
          description: r.description,
          brewMethod: r.brewMethod ?? null,
          grindSize: r.grindSize ?? null,
          phases: r.phases,
          brewTime: r.brewTime,
          dose: r.dose,
          waterMl: r.waterMl,
          notes: r.notes,
          userId: userByName[r.user].id,
        },
      });
      recipes.push(recipe);
    }

    // Recipe likes
    const recipeLikeTargets = recipes.slice(0, 3);
    for (const [i, recipe] of recipeLikeTargets.entries()) {
      const liker = i % 3 === 0 ? alice : i % 3 === 1 ? bob : dev;
      if (liker.id !== recipe.userId) {
        await this.prisma.recipeLike.create({
          data: { recipeId: recipe.id, userId: liker.id },
        });
      }
    }

    // Sign in as the dev user and return the session. This is the only place the
    // dev password is used after seeding.
    const session = await this.auth.login(devEmail, devPassword);

    return {
      message: 'Seeded',
      roasters: roasters.length,
      entries: entries.length,
      recipes: recipes.length,
      token: session.token,
      user: session.user,
    };
  }
}
