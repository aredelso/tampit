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
exports.FollowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FollowsService = class FollowsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async followUser(followerId, followingId) {
        if (followerId === followingId) {
            throw new common_1.BadRequestException('Cannot follow yourself');
        }
        try {
            return await this.prisma.userFollow.create({
                data: { followerId, followingId },
            });
        }
        catch (error) {
            if (error?.code === 'P2002') {
                throw new common_1.ConflictException('Already following this user');
            }
            throw error;
        }
    }
    async unfollowUser(followerId, followingId) {
        await this.prisma.userFollow.deleteMany({
            where: { followerId, followingId },
        });
    }
    async isFollowingUser(followerId, followingId) {
        const result = await this.prisma.userFollow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });
        return !!result;
    }
    async getUserFollowCounts(userId) {
        const [followers, following] = await Promise.all([
            this.prisma.userFollow.count({ where: { followingId: userId } }),
            this.prisma.userFollow.count({ where: { followerId: userId } }),
        ]);
        return { followers, following };
    }
    async getUserFollowers(userId) {
        const follows = await this.prisma.userFollow.findMany({
            where: { followingId: userId },
            select: { follower: { select: { id: true, name: true, photo: true } } },
        });
        return follows.map((f) => f.follower);
    }
    async getUserFollowingUsers(userId) {
        const follows = await this.prisma.userFollow.findMany({
            where: { followerId: userId },
            select: { following: { select: { id: true, name: true, photo: true } } },
        });
        return follows.map((f) => f.following);
    }
    async getUserFollowingRoasters(userId) {
        const follows = await this.prisma.roasterFollow.findMany({
            where: { followerId: userId },
            select: {
                roaster: { select: { id: true, name: true, logoUrl: true } },
            },
        });
        return follows.map((f) => f.roaster);
    }
    async followRoaster(followerId, roasterId) {
        try {
            return await this.prisma.roasterFollow.create({
                data: { followerId, roasterId },
            });
        }
        catch (error) {
            if (error?.code === 'P2002') {
                throw new common_1.ConflictException('Already following this roaster');
            }
            throw error;
        }
    }
    async unfollowRoaster(followerId, roasterId) {
        await this.prisma.roasterFollow.deleteMany({
            where: { followerId, roasterId },
        });
    }
    async isFollowingRoaster(followerId, roasterId) {
        const result = await this.prisma.roasterFollow.findUnique({
            where: { followerId_roasterId: { followerId, roasterId } },
        });
        return !!result;
    }
    async getRoasterFollowerCount(roasterId) {
        return this.prisma.roasterFollow.count({ where: { roasterId } });
    }
    async getRoasterFollowers(roasterId) {
        const follows = await this.prisma.roasterFollow.findMany({
            where: { roasterId },
            select: { follower: { select: { id: true, name: true, photo: true } } },
        });
        return follows.map((f) => f.follower);
    }
};
exports.FollowsService = FollowsService;
exports.FollowsService = FollowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FollowsService);
