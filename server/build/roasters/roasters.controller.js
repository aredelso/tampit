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
exports.RoastersController = void 0;
const common_1 = require("@nestjs/common");
const roasters_service_1 = require("./roasters.service");
const entries_service_1 = require("../entries/entries.service");
const extract_user_1 = require("../auth/extract-user");
let RoastersController = class RoastersController {
    constructor(roasters, entries) {
        this.roasters = roasters;
        this.entries = entries;
    }
    findAll(search) {
        if (search)
            return this.roasters.findByName(search);
        return this.roasters.findAll();
    }
    findOneById(id) {
        return this.roasters.findOne(Number(id));
    }
    getEntries(id) {
        return this.entries.findByRoaster(Number(id));
    }
    create(body) {
        if (!body.name)
            throw new common_1.BadRequestException('name is required');
        return this.roasters.create(body.name);
    }
    update(id, body) {
        return this.roasters.update(Number(id), body);
    }
    remove(id) {
        return this.roasters.remove(Number(id));
    }
    getMyRoaster(req) {
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.roasters.getMyRoaster(userId);
    }
    createMyRoaster(req, body) {
        if (!body.name)
            throw new common_1.BadRequestException('name is required');
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.roasters.createRoaster(userId, {
            name: body.name,
            location: body.location,
            logoUrl: body.logoUrl,
            contactEmail: body.contactEmail,
        });
    }
    claimRoaster(id, req) {
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.roasters.claimRoaster(Number(id), userId);
    }
    updateMyRoaster(req, body) {
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.roasters.updateMyRoaster(userId, body);
    }
    extractContactEmail(body) {
        return this.roasters.extractContactEmail(body.websiteUrl, body.websiteContent);
    }
    extractContactEmailByName(body) {
        if (!body.roasterName)
            throw new common_1.BadRequestException('roasterName is required');
        return this.roasters.extractContactEmailByRoasterName(body.roasterName);
    }
};
exports.RoastersController = RoastersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "findOneById", null);
__decorate([
    (0, common_1.Get)(':id/entries'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "getEntries", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('my/profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "getMyRoaster", null);
__decorate([
    (0, common_1.Post)('my/create'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "createMyRoaster", null);
__decorate([
    (0, common_1.Post)(':id/claim'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "claimRoaster", null);
__decorate([
    (0, common_1.Put)('my/profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "updateMyRoaster", null);
__decorate([
    (0, common_1.Post)('extract-contact-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "extractContactEmail", null);
__decorate([
    (0, common_1.Post)('extract-contact-email-by-name'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoastersController.prototype, "extractContactEmailByName", null);
exports.RoastersController = RoastersController = __decorate([
    (0, common_1.Controller)('roasters'),
    __metadata("design:paramtypes", [roasters_service_1.RoastersService,
        entries_service_1.EntriesService])
], RoastersController);
