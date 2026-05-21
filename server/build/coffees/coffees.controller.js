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
exports.CoffeesController = void 0;
const common_1 = require("@nestjs/common");
const coffees_service_1 = require("./coffees.service");
const extract_user_1 = require("../auth/extract-user");
let CoffeesController = class CoffeesController {
    constructor(coffees) {
        this.coffees = coffees;
    }
    findAll(roasterId) {
        return this.coffees.findAll(roasterId ? Number(roasterId) : undefined);
    }
    findByOrigin(origin) {
        return this.coffees.findByOrigin(decodeURIComponent(origin));
    }
    findOne(id) {
        return this.coffees.findOne(Number(id));
    }
    create(body) {
        if (!body.roasterId)
            throw new common_1.BadRequestException('roasterId required');
        if (!body.name)
            throw new common_1.BadRequestException('name required');
        return this.coffees.create(body.roasterId, body.name, body.origin, body.process, body.description, body.photoUrl);
    }
    update(id, body) {
        if (!body.name)
            throw new common_1.BadRequestException('name required');
        return this.coffees.update(Number(id), body.name, body.origin, body.process, body.description, body.photoUrl);
    }
    remove(id) {
        return this.coffees.remove(Number(id));
    }
    createForMyRoaster(req, body) {
        if (!body.name)
            throw new common_1.BadRequestException('name required');
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.coffees.createForRoaster(userId, body.name, body.origin, body.process, body.description, body.photoUrl);
    }
    updateForMyRoaster(id, req, body) {
        if (!body.name)
            throw new common_1.BadRequestException('name required');
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.coffees.updateForRoaster(userId, Number(id), body.name, body.origin, body.process, body.description, body.photoUrl);
    }
    deleteForMyRoaster(id, req) {
        const userId = (0, extract_user_1.extractUserId)(req);
        return this.coffees.deleteForRoaster(userId, Number(id));
    }
};
exports.CoffeesController = CoffeesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('roasterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoffeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-origin/:origin'),
    __param(0, (0, common_1.Param)('origin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoffeesController.prototype, "findByOrigin", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoffeesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CoffeesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CoffeesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoffeesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('my/create'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CoffeesController.prototype, "createForMyRoaster", null);
__decorate([
    (0, common_1.Put)('my/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CoffeesController.prototype, "updateForMyRoaster", null);
__decorate([
    (0, common_1.Delete)('my/:id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CoffeesController.prototype, "deleteForMyRoaster", null);
exports.CoffeesController = CoffeesController = __decorate([
    (0, common_1.Controller)('coffees'),
    __metadata("design:paramtypes", [coffees_service_1.CoffeesService])
], CoffeesController);
