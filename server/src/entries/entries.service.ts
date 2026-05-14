import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WsGateway } from '../ws/ws.gateway';
import { TagsService } from '../tags/tags.service';

export type EntryBody = {
  roaster: string;
  coffee: string;
  roasterLocation?: string;
  origin?: string;
  brewMethod: string;
  dose?: number;
  waterMl?: number;
  userId: string | null;
  notes?: string;
  rating?: number;
  photoUrl?: string;
  flavorNotes?: string[];
};

@Injectable()
export class EntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WsGateway,
    private readonly tagsService: TagsService
  ) {}

  private mapEntry(e: any) {
    return {
      id: e.id,
      createdAt: e.createdAt.toISOString(),
      roasterId: e.roaster.id,
      roasterName: e.roaster.name,
      roasterLogoUrl: e.roaster?.logoUrl ?? null,
      coffeeId: e.coffee.id,
      coffeeName: e.coffee.name,
      coffeePhotoUrl: e.coffee.photoUrl ?? null,
      origin: e.origin ?? undefined,
      brewMethod: e.brewMethod,
      dose: e.dose > 0 ? e.dose : undefined,
      waterMl: e.waterMl > 0 ? e.waterMl : undefined,
      likes: e.likes.length,
      likedBy: e.likes.map((l: any) => l.user?.name ?? l.userId),
      comments: e.comments.map((c: any) => ({
        id: c.id,
        content: c.content,
        userId: c.userId,
        userName: c.user?.name ?? null,
        userPhoto: c.user?.photo ?? null,
        createdAt: c.createdAt.toISOString(),
        likes: c.likes?.length ?? 0,
        likedBy: c.likes?.map((l: any) => l.user?.name ?? l.userId) ?? [],
      })),
      userId: e.userId ?? null,
      userName: e.user?.name ?? null,
      userPhoto: e.user?.photo ?? null,
      notes: e.notes,
      rating: e.rating ?? null,
      photoUrl: e.photoUrl ?? null,
      flavorNotes: e.flavorNotes ?? [],
    };
  }

  private readonly include = {
    roaster: { select: { id: true, name: true, logoUrl: true } },
    coffee: { select: { id: true, name: true, photoUrl: true } },
    likes: { select: { userId: true, user: { select: { name: true } } } },
    comments: {
      select: {
        id: true,
        content: true,
        userId: true,
        createdAt: true,
        user: { select: { name: true, photo: true } },
        likes: { select: { userId: true, user: { select: { name: true } } } },
      },
    },
    user: { select: { id: true, name: true, email: true, photo: true } },
  };

  async findAll() {
    const entries = await this.prisma.coffeeEntry.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.include,
    });
    return entries.map((e) => this.mapEntry(e));
  }

  async findByUser(userId: string) {
    const entries = await this.prisma.coffeeEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: this.include,
    });
    return entries.map((e) => this.mapEntry(e));
  }

  async findByCoffee(coffeeId: number) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id: coffeeId },
    });
    if (!coffee) return [];
    const entries = await this.prisma.coffeeEntry.findMany({
      where: { coffeeId: coffee.id },
      orderBy: { createdAt: 'desc' },
      include: this.include,
    });
    return entries.map((e) => this.mapEntry(e));
  }

  async findByFlavorNote(tag: string) {
    const entries = await this.prisma.coffeeEntry.findMany({
      where: { flavorNotes: { has: tag } },
      orderBy: { createdAt: 'desc' },
      include: this.include,
    });
    return entries.map((e) => this.mapEntry(e));
  }

  async findByRoaster(roasterId: number) {
    const entries = await this.prisma.coffeeEntry.findMany({
      where: { roasterId },
      orderBy: { createdAt: 'desc' },
      include: this.include,
    });
    return entries.map((e) => this.mapEntry(e));
  }

  private async resolveRoasterAndCoffee(body: EntryBody) {
    let roaster = await this.prisma.roaster.findFirst({
      where: { name: body.roaster },
    });
    if (!roaster) {
      roaster = await this.prisma.roaster.create({
        data: { name: body.roaster, location: body.roasterLocation ?? null },
      });
    }
    const coffee = await this.prisma.coffee.upsert({
      where: { name_roasterId: { name: body.coffee, roasterId: roaster.id } },
      update: {},
      create: {
        name: body.coffee,
        origin: body.origin ?? null,
        roasterId: roaster.id,
      },
    });
    return { roaster, coffee };
  }

  async create(body: EntryBody) {
    const flavorNotes = body.flavorNotes ?? [];
    await this.tagsService.upsertMany(flavorNotes);
    const { roaster, coffee } = await this.resolveRoasterAndCoffee(body);
    const entry = await this.prisma.coffeeEntry.create({
      data: {
        roasterId: roaster.id,
        coffeeId: coffee.id,
        origin: body.origin ? String(body.origin) : null,
        brewMethod: String(body.brewMethod ?? ''),
        dose: Number(body.dose ?? 0),
        waterMl: Number(body.waterMl ?? 0),
        userId: String(body.userId),
        notes: body.notes ? String(body.notes) : null,
        rating: body.rating ?? null,
        photoUrl: body.photoUrl ?? null,
        flavorNotes,
      },
      include: this.include,
    });
    return this.mapEntry(entry);
  }

  async update(id: number, body: EntryBody) {
    const flavorNotes = body.flavorNotes ?? [];
    await this.tagsService.upsertMany(flavorNotes);
    const { roaster, coffee } = await this.resolveRoasterAndCoffee(body);
    const entry = await this.prisma.coffeeEntry.update({
      where: { id },
      data: {
        roasterId: roaster.id,
        coffeeId: coffee.id,
        brewMethod: String(body.brewMethod ?? ''),
        dose: Number(body.dose ?? 0),
        waterMl: Number(body.waterMl ?? 0),
        userId: String(body.userId),
        origin: body.origin ? String(body.origin) : null,
        notes: body.notes ? String(body.notes) : null,
        rating: body.rating ?? null,
        photoUrl: body.photoUrl ?? null,
        flavorNotes,
      },
      include: this.include,
    });
    return this.mapEntry(entry);
  }

  async remove(id: number) {
    await this.prisma.like.deleteMany({ where: { entryId: id } });
    await this.prisma.comment.deleteMany({ where: { entryId: id } });
    await this.prisma.coffeeEntry.delete({ where: { id } });
  }

  async getRoasters() {
    const roasters = await this.prisma.roaster.findMany({
      orderBy: { name: 'asc' },
      select: { name: true },
    });
    return roasters.map((r) => r.name);
  }

  async addLike(entryId: number, userId: string) {
    try {
      await this.prisma.like.create({ data: { entryId, userId } });
    } catch (err: any) {
      if (err?.code === 'P2002') throw new ConflictException('Already liked');
      throw err;
    }
    await this.broadcastLikes(entryId);
  }

  async removeLike(entryId: number, userId: string) {
    await this.prisma.like.deleteMany({ where: { entryId, userId } });
    await this.broadcastLikes(entryId);
  }

  async getComments(entryId: number) {
    const comments = await this.prisma.comment.findMany({
      where: { entryId },
      orderBy: { createdAt: 'asc' },
    });
    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      userId: c.userId,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async addComment(entryId: number, userId: string, content: string) {
    const comment = await this.prisma.comment.create({
      data: { entryId, userId, content },
    });
    const payload = {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      createdAt: comment.createdAt.toISOString(),
    };
    this.ws.broadcast({ type: 'comment_added', entryId, comment: payload });
    return payload;
  }

  async addCommentLike(commentId: number, userId: string) {
    try {
      await this.prisma.commentLike.create({ data: { commentId, userId } });
    } catch (err: any) {
      if (err?.code === 'P2002') throw new ConflictException('Already liked');
      throw err;
    }
  }

  async removeCommentLike(commentId: number, userId: string) {
    await this.prisma.commentLike.deleteMany({ where: { commentId, userId } });
  }

  private async broadcastLikes(entryId: number) {
    const likes = await this.prisma.like.findMany({
      where: { entryId },
      select: { userId: true, user: { select: { name: true } } },
    });
    this.ws.broadcast({
      type: 'likes_updated',
      entryId,
      likes: likes.length,
      likedBy: likes.map((l) => l.user?.name ?? l.userId),
    });
  }
}
