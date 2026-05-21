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
exports.EntriesController = void 0;
const common_1 = require("@nestjs/common");
const entries_service_1 = require("./entries.service");
const extract_user_1 = require("../auth/extract-user");
let EntriesController = class EntriesController {
    constructor(entries) {
        this.entries = entries;
    }
    feed(page = '1', limit = '10', feedType, req) {
        let userId;
        if (feedType === 'following' && req) {
            try {
                userId = (0, extract_user_1.extractUserId)(req);
            }
            catch {
                throw new common_1.ForbiddenException('Authentication required for following feed');
            }
        }
        return this.entries.getPaginatedFeed(Number(page), Number(limit), feedType, userId);
    }
    findAll() {
        return this.entries.findAll();
    }
    findByTag(tag) {
        return this.entries.findByFlavorNote(tag);
    }
    getCoffeesByTag(tag) {
        return this.entries.getCoffeesByTag(tag);
    }
    findByCoffee(coffeeId) {
        return this.entries.findByCoffee(Number(coffeeId));
    }
    create(body, req) {
        const token = (0, extract_user_1.extractToken)(req);
        if (token.userType !== 'STANDARD')
            throw new common_1.ForbiddenException('Only standard users can create entries');
        return this.entries.create({ ...body, userId: token.userId });
    }
    update(id, body, req) {
        const token = (0, extract_user_1.extractToken)(req);
        if (token.userType !== 'STANDARD')
            throw new common_1.ForbiddenException('Only standard users can update entries');
        return this.entries.update(Number(id), { ...body, userId: token.userId });
    }
    remove(id) {
        return this.entries.remove(Number(id));
    }
    addLike(id, req) {
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.entries.addLike(Number(id), userId);
    }
    removeLike(id, req) {
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.entries.removeLike(Number(id), userId);
    }
    getComments(id) {
        return this.entries.getComments(Number(id));
    }
    addComment(id, body, req) {
        if (!body.content)
            throw new common_1.BadRequestException('content required');
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.entries.addComment(Number(id), userId, body.content);
    }
    addCommentLike(commentId, req) {
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.entries.addCommentLike(Number(commentId), userId);
    }
    removeCommentLike(commentId, req) {
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.entries.removeCommentLike(Number(commentId), userId);
    }
};
exports.EntriesController = EntriesController;
__decorate([
    (0, common_1.Get)('feed'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('feed')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "feed", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-tag/:tag'),
    __param(0, (0, common_1.Param)('tag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "findByTag", null);
__decorate([
    (0, common_1.Get)('coffees-by-tag/:tag'),
    __param(0, (0, common_1.Param)('tag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "getCoffeesByTag", null);
__decorate([
    (0, common_1.Get)('by-coffee/:coffeeId'),
    __param(0, (0, common_1.Param)('coffeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "findByCoffee", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/likes'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "addLike", null);
__decorate([
    (0, common_1.Delete)(':id/likes'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "removeLike", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)(':id/comments/:commentId/likes'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "addCommentLike", null);
__decorate([
    (0, common_1.Delete)(':id/comments/:commentId/likes'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EntriesController.prototype, "removeCommentLike", null);
exports.EntriesController = EntriesController = __decorate([
    (0, common_1.Controller)('entries'),
    __metadata("design:paramtypes", [entries_service_1.EntriesService])
], EntriesController);
