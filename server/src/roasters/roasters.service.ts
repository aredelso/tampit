import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoastersService {
  constructor(private readonly prisma: PrismaService) {}

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
    data: { name?: string; location?: string; logoUrl?: string }
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
}
