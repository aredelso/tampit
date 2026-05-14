import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<string[]> {
    const tags = await this.prisma.flavorTag.findMany({
      orderBy: { name: 'asc' },
      select: { name: true },
    });
    return tags.map((t) => t.name);
  }

  async topForCoffee(
    coffeeId: number
  ): Promise<{ tag: string; count: number }[]> {
    const entries = await this.prisma.coffeeEntry.findMany({
      where: { coffeeId },
      select: { flavorNotes: true },
    });
    const counts = new Map<string, number>();
    for (const entry of entries) {
      for (const tag of entry.flavorNotes) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }

  async upsertMany(names: string[]): Promise<void> {
    if (!names.length) return;
    await this.prisma.flavorTag.createMany({
      data: names.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }
}
