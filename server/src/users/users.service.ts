import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string | null, email: string | null) {
    return this.prisma.user.create({ data: { name, email } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, photo: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findCoffees(userId: string) {
    const groups = await this.prisma.coffeeEntry.groupBy({
      by: ['coffeeId'],
      where: { userId },
      _count: { id: true },
      _avg: { rating: true },
    });

    if (!groups.length) return [];

    const coffeeIds = groups.map((g) => g.coffeeId);
    const coffees = await this.prisma.coffee.findMany({
      where: { id: { in: coffeeIds } },
      include: { roaster: { select: { id: true, name: true, logoUrl: true } } },
    });

    const byId = Object.fromEntries(coffees.map((c) => [c.id, c]));
    return groups
      .map((g) => {
        const c = byId[g.coffeeId];
        if (!c) return null;
        return {
          id: c.id,
          name: c.name,
          origin: c.origin,
          roasterId: c.roaster.id,
          roasterName: c.roaster.name,
          roasterLogoUrl: c.roaster.logoUrl ?? null,
          entryCount: g._count.id,
          avgRating: g._avg.rating ?? null,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.entryCount - a!.entryCount);
  }

  async findEntries(id: string) {
    const entries = await this.prisma.coffeeEntry.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        roaster: { select: { name: true } },
        likes: { select: { userId: true, user: { select: { name: true } } } },
        comments: {
          select: { id: true, content: true, userId: true, createdAt: true },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return entries.map((e) => ({
      id: e.id,
      createdAt: e.createdAt.toISOString(),
      roaster: e.roaster?.name ?? '',
      coffee: e.coffee,
      brewMethod: e.brewMethod,
      dose: e.dose,
      waterMl: e.waterMl,
      likes: e.likes.length,
      likedBy: e.likes.map((l) => l.user?.name ?? l.userId),
      comments: e.comments.map((c) => ({
        id: c.id,
        content: c.content,
        userId: c.userId,
        createdAt: c.createdAt.toISOString(),
      })),
      userId: e.userId ?? null,
      userName: e.user?.name ?? null,
      notes: e.notes,
    }));
  }
}
