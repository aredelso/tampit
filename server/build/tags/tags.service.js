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
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TagsService = class TagsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const tags = await this.prisma.flavorTag.findMany({
            orderBy: { name: 'asc' },
            select: { name: true },
        });
        return tags.map((t) => t.name);
    }
    async topForCoffee(coffeeId) {
        const entries = await this.prisma.coffeeEntry.findMany({
            where: { coffeeId },
            select: { flavorNotes: true },
        });
        const counts = new Map();
        for (const entry of entries) {
            for (const tag of entry.flavorNotes) {
                counts.set(tag, (counts.get(tag) ?? 0) + 1);
            }
        }
        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => ({ tag, count }));
    }
    async upsertMany(names) {
        if (!names.length)
            return;
        await this.prisma.flavorTag.createMany({
            data: names.map((name) => ({ name })),
            skipDuplicates: true,
        });
    }
};
exports.TagsService = TagsService;
exports.TagsService = TagsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TagsService);
