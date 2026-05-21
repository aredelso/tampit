import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type InventoryPayload = {
  coffeeId: number;
  roastDate?: Date;
  quantity?: number;
  notes?: string;
};

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.coffeeInventory.findMany({
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
  }

  async findByCoffee(coffeeId: number, userId: string) {
    return this.prisma.coffeeInventory.findUnique({
      where: {
        userId_coffeeId: { userId, coffeeId },
      },
      include: {
        coffee: {
          include: {
            roaster: true,
          },
        },
      },
    });
  }

  async addToInventory(userId: string, payload: InventoryPayload) {
    return this.prisma.coffeeInventory.upsert({
      where: {
        userId_coffeeId: { userId, coffeeId: payload.coffeeId },
      },
      update: {
        ...(payload.quantity !== undefined && { quantity: payload.quantity }),
        ...(payload.roastDate !== undefined && {
          roastDate: payload.roastDate,
        }),
        ...(payload.notes !== undefined && { notes: payload.notes }),
        updatedAt: new Date(),
      },
      create: {
        userId,
        coffeeId: payload.coffeeId,
        roastDate: payload.roastDate ?? null,
        quantity: payload.quantity ?? 1,
        notes: payload.notes ?? null,
      },
      include: {
        coffee: {
          include: {
            roaster: true,
          },
        },
      },
    });
  }

  async updateInventory(
    userId: string,
    coffeeId: number,
    payload: Partial<InventoryPayload>
  ) {
    return this.prisma.coffeeInventory.update({
      where: {
        userId_coffeeId: { userId, coffeeId },
      },
      data: {
        ...(payload.quantity !== undefined && { quantity: payload.quantity }),
        ...(payload.roastDate !== undefined && {
          roastDate: payload.roastDate,
        }),
        ...(payload.notes !== undefined && { notes: payload.notes }),
        updatedAt: new Date(),
      },
      include: {
        coffee: {
          include: {
            roaster: true,
          },
        },
      },
    });
  }

  async removeFromInventory(userId: string, coffeeId: number) {
    return this.prisma.coffeeInventory.delete({
      where: {
        userId_coffeeId: { userId, coffeeId },
      },
    });
  }
}
