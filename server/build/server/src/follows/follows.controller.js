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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsController = void 0;
const common_1 = require("@nestjs/common");
const follows_service_1 = require("./follows.service");
const extract_user_1 = require("../auth/extract-user");
let FollowsController = class FollowsController {
    constructor(follows) {
        this.follows = follows;
    }
    async followUser(targetId, req) {
        const followerId = (0, extract_user_1.extractUserId)(req);
        await this.follows.followUser(followerId, targetId);
        return { followerId, followingId: targetId };
    }
    async unfollowUser(targetId, req) {
        const followerId = (0, extract_user_1.extractUserId)(req);
        await this.follows.unfollowUser(followerId, targetId);
    }
    async userFollowStatus(targetId, req) {
        const followerId = (0, extract_user_1.extractUserId)(req);
        const following = await this.follows.isFollowingUser(followerId, targetId);
        return { following };
    }
    async userFollowCounts(targetId) {
        return this.follows.getUserFollowCounts(targetId);
    }
    async userFollowers(targetId) {
        return this.follows.getUserFollowers(targetId);
    }
    async userFollowingUsers(targetId) {
        return this.follows.getUserFollowingUsers(targetId);
    }
    async userFollowingRoasters(targetId) {
        return this.follows.getUserFollowingRoasters(targetId);
    }
    async followRoaster(roasterId, req) {
        const followerId = (0, extract_user_1.extractUserId)(req);
        await this.follows.followRoaster(followerId, Number(roasterId));
        return { followerId, roasterId: Number(roasterId) };
    }
    async unfollowRoaster(roasterId, req) {
        const followerId = (0, extract_user_1.extractUserId)(req);
        await this.follows.unfollowRoaster(followerId, Number(roasterId));
    }
    async roasterFollowStatus(roasterId, req) {
        const followerId = (0, extract_user_1.extractUserId)(req);
        const following = await this.follows.isFollowingRoaster(followerId, Number(roasterId));
        return { following };
    }
    async roasterFollowCounts(roasterId) {
        const followers = await this.follows.getRoasterFollowerCount(Number(roasterId));
        return { followers };
    }
    async roasterFollowers(roasterId) {
        return this.follows.getRoasterFollowers(Number(roasterId));
    }
};
exports.FollowsController = FollowsController;
__decorate([
    (0, common_1.Post)('users/:targetId'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Param)('targetId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "followUser", null);
__decorate([
    (0, common_1.Delete)('users/:targetId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('targetId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "unfollowUser", null);
__decorate([
    (0, common_1.Get)('users/:targetId/status'),
    __param(0, (0, common_1.Param)('targetId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "userFollowStatus", null);
__decorate([
    (0, common_1.Get)('users/:targetId/counts'),
    __param(0, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "userFollowCounts", null);
__decorate([
    (0, common_1.Get)('users/:targetId/followers'),
    __param(0, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "userFollowers", null);
__decorate([
    (0, common_1.Get)('users/:targetId/following/users'),
    __param(0, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "userFollowingUsers", null);
__decorate([
    (0, common_1.Get)('users/:targetId/following/roasters'),
    __param(0, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "userFollowingRoasters", null);
__decorate([
    (0, common_1.Post)('roasters/:roasterId'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Param)('roasterId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "followRoaster", null);
__decorate([
    (0, common_1.Delete)('roasters/:roasterId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('roasterId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "unfollowRoaster", null);
__decorate([
    (0, common_1.Get)('roasters/:roasterId/status'),
    __param(0, (0, common_1.Param)('roasterId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "roasterFollowStatus", null);
__decorate([
    (0, common_1.Get)('roasters/:roasterId/counts'),
    __param(0, (0, common_1.Param)('roasterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "roasterFollowCounts", null);
__decorate([
    (0, common_1.Get)('roasters/:roasterId/followers'),
    __param(0, (0, common_1.Param)('roasterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "roasterFollowers", null);
exports.FollowsController = FollowsController = __decorate([
    (0, common_1.Controller)('follows'),
    __metadata("design:paramtypes", [follows_service_1.FollowsService])
], FollowsController);
