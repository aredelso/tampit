import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class RoastersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService
  ) {}

  findAll() {
    return this.prisma.roaster.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const roaster = await this.prisma.roaster.findUnique({ where: { id } });
    if (!roaster) throw new NotFoundException('Roaster not found');
    return roaster;
  }

  async findByName(name: string) {
    const roasters = await this.prisma.roaster.findMany({
      where: { name: { contains: name } },
      orderBy: { name: 'asc' },
    });
    if (!roasters.length) throw new NotFoundException('Roasters not found');
    return roasters;
  }

  async create(name: string) {
    try {
      return await this.prisma.roaster.create({ data: { name } });
    } catch (err: any) {
      if (err?.code === 'P2002')
        throw new ConflictException('Roaster already exists');
      throw err;
    }
  }

  async update(
    id: number,
    data: {
      name?: string;
      location?: string;
      logoUrl?: string;
      contactEmail?: string;
    }
  ) {
    try {
      return await this.prisma.roaster.update({ where: { id }, data });
    } catch (err: any) {
      if (err?.code === 'P2025')
        throw new NotFoundException('Roaster not found');
      if (err?.code === 'P2002')
        throw new ConflictException('Name already taken');
      throw err;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.roaster.delete({ where: { id } });
    } catch (err: any) {
      if (err?.code === 'P2025')
        throw new NotFoundException('Roaster not found');
      throw err;
    }
  }

  async createRoaster(
    userId: string,
    data: {
      name: string;
      location?: string;
      logoUrl?: string;
      contactEmail?: string;
    }
  ) {
    try {
      return await this.prisma.roaster.create({
        data: {
          name: data.name,
          location: data.location ?? null,
          logoUrl: data.logoUrl ?? null,
          contactEmail: data.contactEmail ?? null,
          userId,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002')
        throw new ConflictException('Roaster name already exists');
      throw err;
    }
  }

  async claimRoaster(roasterId: number, userId: string) {
    const roaster = await this.prisma.roaster.findUnique({
      where: { id: roasterId },
    });
    if (!roaster) throw new NotFoundException('Roaster not found');
    if (roaster.userId)
      throw new ConflictException('Roaster is already claimed');

    return await this.prisma.roaster.update({
      where: { id: roasterId },
      data: { userId },
    });
  }

  async getMyRoaster(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.roasterId) return null;
    return await this.prisma.roaster.findUnique({
      where: { id: user.roasterId },
      include: { coffees: true },
    });
  }

  async updateMyRoaster(
    userId: string,
    data: {
      name?: string;
      location?: string;
      logoUrl?: string;
      contactEmail?: string;
    }
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.roasterId)
      throw new NotFoundException('You have not claimed a roaster');
    const roaster = await this.prisma.roaster.findUnique({
      where: { id: user.roasterId },
    });
    if (!roaster) throw new NotFoundException('Roaster not found');

    try {
      return await this.prisma.roaster.update({
        where: { id: roaster.id },
        data,
        include: { coffees: true },
      });
    } catch (err: any) {
      if (err?.code === 'P2002')
        throw new ConflictException('Name already taken');
      throw err;
    }
  }

  async extractContactEmail(
    websiteUrl?: string,
    websiteContent?: string
  ): Promise<{ email: string | null }> {
    const email = await this.ai.extractContactEmailFromWebsite(
      websiteUrl,
      websiteContent
    );
    return { email };
  }

  async extractContactEmailByRoasterName(
    roasterName: string
  ): Promise<{ email: string | null }> {
    const email = await this.ai.extractContactEmailByRoasterName(roasterName);
    return { email };
  }
}
