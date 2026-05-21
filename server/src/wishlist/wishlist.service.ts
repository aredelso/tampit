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
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: { coffee: { include: { roaster: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isInWishlist(userId: string, coffeeId: number) {
    const item = await this.prisma.wishlist.findUnique({
      where: { userId_coffeeId: { userId, coffeeId } },
    });
    return !!item;
  }
}
