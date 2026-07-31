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
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WishlistService = class WishlistService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async add(userId, coffeeId) {
        return this.prisma.wishlist.create({
            data: { userId, coffeeId },
            include: { coffee: { include: { roaster: true } } },
        });
    }
    async remove(userId, coffeeId) {
        return this.prisma.wishlist.deleteMany({
            where: { userId, coffeeId },
        });
    }
    async getByUser(userId) {
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
        const itemsWithStats = await Promise.all(items.map(async (item) => {
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
        }));
        return itemsWithStats;
    }
    async isInWishlist(userId, coffeeId) {
        const item = await this.prisma.wishlist.findUnique({
            where: { userId_coffeeId: { userId, coffeeId } },
        });
        return !!item;
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WishlistService);
