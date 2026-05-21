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
exports.WishlistResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const jwt_guard_1 = require("../auth/jwt.guard");
const wishlist_service_1 = require("./wishlist.service");
let WishlistResolver = class WishlistResolver {
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
    }
    async getWishlist(user) {
        const items = await this.wishlistService.getByUser(user.id);
        return items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
        }));
    }
    async isInWishlist(user, coffeeId) {
        return this.wishlistService.isInWishlist(user.id, coffeeId);
    }
    async addToWishlist(user, coffeeId) {
        const item = await this.wishlistService.add(user.id, coffeeId);
        return {
            ...item,
            createdAt: item.createdAt.toISOString(),
        };
    }
    async removeFromWishlist(user, coffeeId) {
        const result = await this.wishlistService.remove(user.id, coffeeId);
        return result.count > 0;
    }
};
exports.WishlistResolver = WishlistResolver;
__decorate([
    (0, graphql_1.Query)('wishlist'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WishlistResolver.prototype, "getWishlist", null);
__decorate([
    (0, graphql_1.Query)('isInWishlist'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('coffeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WishlistResolver.prototype, "isInWishlist", null);
__decorate([
    (0, graphql_1.Mutation)('addToWishlist'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('coffeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WishlistResolver.prototype, "addToWishlist", null);
__decorate([
    (0, graphql_1.Mutation)('removeFromWishlist'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('coffeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WishlistResolver.prototype, "removeFromWishlist", null);
exports.WishlistResolver = WishlistResolver = __decorate([
    (0, graphql_1.Resolver)('WishlistItem'),
    __metadata("design:paramtypes", [wishlist_service_1.WishlistService])
], WishlistResolver);
