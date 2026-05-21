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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUser(userId) {
        return this.prisma.coffeeInventory.findMany({
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
    }
    async findByCoffee(coffeeId, userId) {
        return this.prisma.coffeeInventory.findUnique({
            where: {
                userId_coffeeId: { userId, coffeeId },
            },
            include: {
                coffee: {
                    include: {
                        roaster: true,
                    },
                },
            },
        });
    }
    async addToInventory(userId, payload) {
        return this.prisma.coffeeInventory.upsert({
            where: {
                userId_coffeeId: { userId, coffeeId: payload.coffeeId },
            },
            update: {
                ...(payload.quantity !== undefined && { quantity: payload.quantity }),
                ...(payload.roastDate !== undefined && {
                    roastDate: payload.roastDate,
                }),
                ...(payload.notes !== undefined && { notes: payload.notes }),
                updatedAt: new Date(),
            },
            create: {
                userId,
                coffeeId: payload.coffeeId,
                roastDate: payload.roastDate ?? null,
                quantity: payload.quantity ?? 1,
                notes: payload.notes ?? null,
            },
            include: {
                coffee: {
                    include: {
                        roaster: true,
                    },
                },
            },
        });
    }
    async updateInventory(userId, coffeeId, payload) {
        return this.prisma.coffeeInventory.update({
            where: {
                userId_coffeeId: { userId, coffeeId },
            },
            data: {
                ...(payload.quantity !== undefined && { quantity: payload.quantity }),
                ...(payload.roastDate !== undefined && {
                    roastDate: payload.roastDate,
                }),
                ...(payload.notes !== undefined && { notes: payload.notes }),
                updatedAt: new Date(),
            },
            include: {
                coffee: {
                    include: {
                        roaster: true,
                    },
                },
            },
        });
    }
    async removeFromInventory(userId, coffeeId) {
        return this.prisma.coffeeInventory.delete({
            where: {
                userId_coffeeId: { userId, coffeeId },
            },
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
