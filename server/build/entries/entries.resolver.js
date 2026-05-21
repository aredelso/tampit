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
exports.EntriesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const entries_service_1 = require("./entries.service");
let EntriesResolver = class EntriesResolver {
    constructor(entriesService) {
        this.entriesService = entriesService;
    }
    async likeEntry(entryId, user) {
        const userId = user?.id || user;
        await this.entriesService.addLike(entryId, userId);
        return this.entriesService.findById(entryId);
    }
    async unlikeEntry(entryId, user) {
        const userId = user?.id || user;
        await this.entriesService.removeLike(entryId, userId);
        return this.entriesService.findById(entryId);
    }
    async commentEntry(entryId, content, user) {
        const userId = user?.id || user;
        await this.entriesService.addComment(entryId, userId, content);
        return this.entriesService.findById(entryId);
    }
    async likeComment(entryId, commentId, user) {
        const userId = user?.id || user;
        await this.entriesService.addCommentLike(commentId, userId);
        return this.entriesService.findById(entryId);
    }
    async unlikeComment(entryId, commentId, user) {
        const userId = user?.id || user;
        await this.entriesService.removeCommentLike(commentId, userId);
        return this.entriesService.findById(entryId);
    }
};
exports.EntriesResolver = EntriesResolver;
__decorate([
    (0, graphql_1.Mutation)(),
    __param(0, (0, graphql_1.Args)('entryId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EntriesResolver.prototype, "likeEntry", null);
__decorate([
    (0, graphql_1.Mutation)(),
    __param(0, (0, graphql_1.Args)('entryId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EntriesResolver.prototype, "unlikeEntry", null);
__decorate([
    (0, graphql_1.Mutation)(),
    __param(0, (0, graphql_1.Args)('entryId')),
    __param(1, (0, graphql_1.Args)('content')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], EntriesResolver.prototype, "commentEntry", null);
__decorate([
    (0, graphql_1.Mutation)(),
    __param(0, (0, graphql_1.Args)('entryId')),
    __param(1, (0, graphql_1.Args)('commentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], EntriesResolver.prototype, "likeComment", null);
__decorate([
    (0, graphql_1.Mutation)(),
    __param(0, (0, graphql_1.Args)('entryId')),
    __param(1, (0, graphql_1.Args)('commentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], EntriesResolver.prototype, "unlikeComment", null);
exports.EntriesResolver = EntriesResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:paramtypes", [entries_service_1.EntriesService])
], EntriesResolver);
