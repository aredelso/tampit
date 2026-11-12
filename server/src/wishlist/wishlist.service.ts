import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, coffeeId: number) {
    return this.prisma.wishlist.create({
      data: { userId, coffeeId },
      include: { coffee: { include: { roaster: true } } },
    });
  }

  async remove(userId: string, coffeeId: number) {
    return this.prisma.wishlist.deleteMany({
      where: { userId, coffeeId },
    });
  }

  async getByUser(userId: string) {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        coffee: {
          include: {
            roaster: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch stats for each coffee
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const stats = await this.prisma.coffeeEntry.aggregate({
          where: { coffeeId: item.coffee.id },
          _count: true,
          _avg: { rating: true },
        });
        return {
          ...item,
          coffee: {
            ...item.coffee,
            entryCount: stats._count,
            avgRating: stats._avg.rating,
          },
        };
      })
    );

    return itemsWithStats;
  }

  async isInWishlist(userId: string, coffeeId: number) {
    const item = await this.prisma.wishlist.findUnique({
      where: { userId_coffeeId: { userId, coffeeId } },
    });
    return !!item;
  }
}
