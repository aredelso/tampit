import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoffeesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly roasterSelect = {
    select: { id: true, name: true, logoUrl: true },
  };

  findAll(roasterId?: number) {
    return this.prisma.coffee.findMany({
      where: roasterId ? { roasterId } : undefined,
      orderBy: { name: 'asc' },
      include: { roaster: this.roasterSelect },
    });
  }

  async findByOrigin(origin: string) {
    const coffees = await this.prisma.coffee.findMany({
      where: { origin },
      include: {
        roaster: this.roasterSelect,
        entries: { select: { rating: true } },
      },
    });
    return coffees
      .map((c: any) => {
        const rated = c.entries.filter((e: any) => e.rating != null);
        const avgRating = rated.length
          ? rated.reduce((s: number, e: any) => s + e.rating!, 0) / rated.length
          : null;
        const { entries, ...rest } = c;
        return { ...rest, avgRating, entryCount: entries.length };
      })
      .sort((a: any, b: any) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
  }

  async findOne(id: number) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: { roaster: this.roasterSelect },
    });
    if (!coffee) throw new NotFoundException('Coffee not found');
    return coffee;
  }

  async create(
    roasterId: number,
    name: string,
    origin?: string,
    process?: string,
    description?: string,
    photoUrl?: string
  ) {
    try {
      return await this.prisma.coffee.create({
        data: { roasterId, name, origin, process, description, photoUrl },
        include: { roaster: this.roasterSelect },
      });
    } catch (err: any) {
      if (err?.code === 'P2002')
        throw new ConflictException('Coffee already exists for this roaster');
      throw err;
    }
  }

  async update(
    id: number,
    name: string,
    origin?: string,
    process?: string,
    description?: string,
    photoUrl?: string
  ) {
    try {
      return await this.prisma.coffee.update({
        where: { id },
        data: { name, origin, process, description, photoUrl },
        include: { roaster: this.roasterSelect },
      });
    } catch (err: any) {
      if (err?.code === 'P2025')
        throw new NotFoundException('Coffee not found');
      if (err?.code === 'P2002')
        throw new ConflictException('Name already taken for this roaster');
      throw err;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.coffee.delete({ where: { id } });
    } catch (err: any) {
      if (err?.code === 'P2025')
        throw new NotFoundException('Coffee not found');
      throw err;
    }
  }

  async createForRoaster(
    userId: string,
    name: string,
    origin?: string,
    process?: string,
    description?: string,
    photoUrl?: string
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.roasterId)
      throw new NotFoundException('You have not claimed a roaster');
    const roaster = await this.prisma.roaster.findUnique({
      where: { id: user.roasterId },
    });
    if (!roaster) throw new NotFoundException('Roaster not found');

    try {
      return await this.prisma.coffee.create({
        data: {
          roasterId: roaster.id,
          name,
          origin,
          process,
          description,
          photoUrl,
        },
        include: { roaster: this.roasterSelect },
      });
    } catch (err: any) {
      if (err?.code === 'P2002')
        throw new ConflictException('Coffee already exists for this roaster');
      throw err;
    }
  }

  async updateForRoaster(
    userId: string,
    coffeeId: number,
    name: string,
    origin?: string,
    process?: string,
    description?: string,
    photoUrl?: string
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.roasterId)
      throw new NotFoundException('You have not claimed a roaster');
    const roaster = await this.prisma.roaster.findUnique({
      where: { id: user.roasterId },
    });
    if (!roaster) throw new NotFoundException('Roaster not found');

    const coffee = await this.prisma.coffee.findUnique({
      where: { id: coffeeId },
    });
    if (!coffee) throw new NotFoundException('Coffee not found');
    if (coffee.roasterId !== roaster.id)
      throw new ForbiddenException('This coffee is not in your roaster');

    try {
      return await this.prisma.coffee.update({
        where: { id: coffeeId },
        data: { name, origin, process, description, photoUrl },
        include: { roaster: this.roasterSelect },
      });
    } catch (err: any) {
      if (err?.code === 'P2025')
        throw new NotFoundException('Coffee not found');
      if (err?.code === 'P2002')
        throw new ConflictException('Name already taken for this roaster');
      throw err;
    }
  }

  async deleteForRoaster(userId: string, coffeeId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.roasterId)
      throw new NotFoundException('You have not claimed a roaster');
    const roaster = await this.prisma.roaster.findUnique({
      where: { id: user.roasterId },
    });
    if (!roaster) throw new NotFoundException('Roaster not found');

    const coffee = await this.prisma.coffee.findUnique({
      where: { id: coffeeId },
    });
    if (!coffee) throw new NotFoundException('Coffee not found');
    if (coffee.roasterId !== roaster.id)
      throw new ForbiddenException('This coffee is not in your roaster');

    try {
      await this.prisma.coffee.delete({ where: { id: coffeeId } });
    } catch (err: any) {
      if (err?.code === 'P2025')
        throw new NotFoundException('Coffee not found');
      throw err;
    }
  }
}
