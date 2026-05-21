"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ws_gateway_1 = require("../ws/ws.gateway");
const tags_service_1 = require("../tags/tags.service");
let EntriesService = class EntriesService {
    constructor(prisma, ws, tagsService) {
        this.prisma = prisma;
        this.ws = ws;
        this.tagsService = tagsService;
        this.include = {
            roaster: { select: { id: true, name: true, logoUrl: true } },
            coffee: { select: { id: true, name: true, photoUrl: true } },
            likes: {
                select: {
                    userId: true,
                    createdAt: true,
                    user: { select: { name: true } },
                },
            },
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
    }
    mapEntry(e) {
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
            likedBy: e.likes.map((l) => ({
                userId: l.userId,
                userName: l.user.name,
            })),
            comments: e.comments.map((c) => ({
                id: c.id,
                content: c.content,
                userId: c.userId,
                userName: c.user.name,
                userPhoto: c.user.photo ?? null,
                createdAt: c.createdAt.toISOString(),
                likes: c.likes?.length ?? 0,
                likedBy: c.likes?.map((l) => ({
                    userId: l.userId,
                    userName: l.user.name,
                })) ?? [],
            })),
            userId: e.userId,
            userName: e.user.name,
            userPhoto: e.user.photo ?? null,
            notes: e.notes,
            rating: e.rating ?? null,
            photoUrl: e.photoUrl ?? null,
            flavorNotes: e.flavorNotes ?? [],
            recipeId: e.recipeId ?? null,
        };
    }
    async findAll() {
        const entries = await this.prisma.coffeeEntry.findMany({
            orderBy: { createdAt: 'desc' },
            include: this.include,
        });
        return entries.map((e) => this.mapEntry(e));
    }
    async getPaginatedFeed(page, limit, feed, userId) {
        let where = {};
        if (feed === 'following' && userId) {
            const [followedUsers, followedRoasters] = await Promise.all([
                this.prisma.userFollow.findMany({
                    where: { followerId: userId },
                    select: { followingId: true },
                }),
                this.prisma.roasterFollow.findMany({
                    where: { followerId: userId },
                    select: { roasterId: true },
                }),
            ]);
            const followedUserIds = followedUsers.map((f) => f.followingId);
            const followedRoasterIds = followedRoasters.map((f) => f.roasterId);
            if (followedUserIds.length === 0 && followedRoasterIds.length === 0) {
                return {
                    data: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                };
            }
            where = {
                OR: [
                    { userId: { in: followedUserIds } },
                    { roasterId: { in: followedRoasterIds } },
                ],
            };
        }
        const allEntries = await this.prisma.coffeeEntry.findMany({
            where,
            include: this.include,
        });
        // Calculate last activity date for each entry
        const entriesWithActivity = allEntries.map((entry) => {
            const latestCommentDate = entry.comments.length
                ? Math.max(...entry.comments.map((c) => c.createdAt.getTime()))
                : 0;
            const latestLikeDate = entry.likes.length
                ? Math.max(...entry.likes.map((l) => l.createdAt?.getTime() ?? 0))
                : 0;
            const lastActivityDate = Math.max(entry.createdAt.getTime(), latestCommentDate, latestLikeDate);
            return { entry, lastActivityDate };
        });
        // Sort by last activity date (most recent first)
        entriesWithActivity.sort((a, b) => b.lastActivityDate - a.lastActivityDate);
        const total = entriesWithActivity.length;
        const skip = (page - 1) * limit;
        const paginatedEntries = entriesWithActivity
            .slice(skip, skip + limit)
            .map((item) => item.entry);
        return {
            data: paginatedEntries.map((e) => this.mapEntry(e)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findByUser(userId) {
        const entries = await this.prisma.coffeeEntry.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: this.include,
        });
        return entries.map((e) => this.mapEntry(e));
    }
    async findById(id) {
        const entry = await this.prisma.coffeeEntry.findUnique({
            where: { id },
            include: this.include,
        });
        return entry ? this.mapEntry(entry) : null;
    }
    async findByCoffee(coffeeId) {
        const coffee = await this.prisma.coffee.findUnique({
            where: { id: coffeeId },
        });
        if (!coffee)
            return [];
        const entries = await this.prisma.coffeeEntry.findMany({
            where: { coffeeId: coffee.id },
            orderBy: { createdAt: 'desc' },
            include: this.include,
        });
        return entries.map((e) => this.mapEntry(e));
    }
    async findByFlavorNote(tag) {
        const entries = await this.prisma.coffeeEntry.findMany({
            where: { flavorNotes: { has: tag } },
            orderBy: { createdAt: 'desc' },
            include: this.include,
        });
        return entries.map((e) => this.mapEntry(e));
    }
    async getCoffeesByTag(tag) {
        const entries = await this.prisma.coffeeEntry.findMany({
            where: { flavorNotes: { has: tag } },
            include: {
                coffee: { select: { id: true, name: true } },
                roaster: { select: { id: true, name: true, logoUrl: true } },
            },
        });
        const coffeeMap = new Map();
        for (const e of entries) {
            const existing = coffeeMap.get(e.coffeeId);
            if (existing) {
                existing.count += 1;
                if (e.rating != null) {
                    existing.ratingSum += e.rating;
                    existing.ratingCount += 1;
                }
            }
            else {
                coffeeMap.set(e.coffeeId, {
                    coffeeId: e.coffeeId,
                    coffeeName: e.coffee.name,
                    roasterId: e.roaster.id,
                    roasterName: e.roaster.name,
                    roasterLogoUrl: e.roaster.logoUrl,
                    count: 1,
                    ratingSum: e.rating ?? 0,
                    ratingCount: e.rating != null ? 1 : 0,
                });
            }
        }
        return [...coffeeMap.values()]
            .map((c) => ({
            ...c,
            avgRating: c.ratingCount > 0 ? c.ratingSum / c.ratingCount : null,
        }))
            .sort((a, b) => {
            const aRating = a.avgRating ?? -1;
            const bRating = b.avgRating ?? -1;
            if (bRating !== aRating)
                return bRating - aRating;
            return b.count - a.count;
        });
    }
    async findByRoaster(roasterId) {
        const entries = await this.prisma.coffeeEntry.findMany({
            where: { roasterId },
            orderBy: { createdAt: 'desc' },
            include: this.include,
        });
        return entries.map((e) => this.mapEntry(e));
    }
    async resolveRoasterAndCoffee(body) {
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
    async create(body) {
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
                recipeId: body.recipeId ?? null,
            },
            include: this.include,
        });
        return this.mapEntry(entry);
    }
    async update(id, body) {
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
                recipeId: body.recipeId ?? null,
            },
            include: this.include,
        });
        return this.mapEntry(entry);
    }
    async remove(id) {
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
    async addLike(entryId, userId) {
        try {
            await this.prisma.like.create({ data: { entryId, userId } });
        }
        catch (err) {
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Already liked');
            throw err;
        }
        await this.broadcastLikes(entryId);
    }
    async removeLike(entryId, userId) {
        await this.prisma.like.deleteMany({ where: { entryId, userId } });
        await this.broadcastLikes(entryId);
    }
    async getComments(entryId) {
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
    async addComment(entryId, userId, content) {
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
    async addCommentLike(commentId, userId) {
        try {
            await this.prisma.commentLike.create({ data: { commentId, userId } });
        }
        catch (err) {
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Already liked');
            throw err;
        }
    }
    async removeCommentLike(commentId, userId) {
        await this.prisma.commentLike.deleteMany({ where: { commentId, userId } });
    }
    async broadcastLikes(entryId) {
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
};
exports.EntriesService = EntriesService;
exports.EntriesService = EntriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ws_gateway_1.WsGateway,
        tags_service_1.TagsService])
], EntriesService);
