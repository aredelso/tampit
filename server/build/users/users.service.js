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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(name, email, roasterId) {
        return this.prisma.user.create({
            data: { name, email, roasterId: roasterId ?? undefined },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                photo: true,
                roasterId: true,
                userType: true,
                verified: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findCoffees(userId) {
        const groups = await this.prisma.coffeeEntry.groupBy({
            by: ['coffeeId'],
            where: { userId },
            _count: { id: true },
            _avg: { rating: true },
        });
        if (!groups.length)
            return [];
        const coffeeIds = groups.map((g) => g.coffeeId);
        const coffees = await this.prisma.coffee.findMany({
            where: { id: { in: coffeeIds } },
            include: { roaster: { select: { id: true, name: true, logoUrl: true } } },
        });
        const byId = Object.fromEntries(coffees.map((c) => [c.id, c]));
        return groups
            .map((g) => {
            const c = byId[g.coffeeId];
            if (!c)
                return null;
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
            .sort((a, b) => b.entryCount - a.entryCount);
    }
    async findEntries(id) {
        const entries = await this.prisma.coffeeEntry.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'desc' },
            include: {
                coffee: { select: { id: true, name: true } },
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
            coffee: e.coffee?.name ?? '',
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
