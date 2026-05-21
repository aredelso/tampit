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
exports.RoastersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let RoastersService = class RoastersService {
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    findAll() {
        return this.prisma.roaster.findMany({ orderBy: { name: 'asc' } });
    }
    async findOne(id) {
        const roaster = await this.prisma.roaster.findUnique({ where: { id } });
        if (!roaster)
            throw new common_1.NotFoundException('Roaster not found');
        return roaster;
    }
    async findByName(name) {
        const roasters = await this.prisma.roaster.findMany({
            where: { name: { contains: name } },
            orderBy: { name: 'asc' },
        });
        if (!roasters.length)
            throw new common_1.NotFoundException('Roasters not found');
        return roasters;
    }
    async create(name) {
        try {
            return await this.prisma.roaster.create({ data: { name } });
        }
        catch (err) {
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Roaster already exists');
            throw err;
        }
    }
    async update(id, data) {
        try {
            return await this.prisma.roaster.update({ where: { id }, data });
        }
        catch (err) {
            if (err?.code === 'P2025')
                throw new common_1.NotFoundException('Roaster not found');
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Name already taken');
            throw err;
        }
    }
    async remove(id) {
        try {
            await this.prisma.roaster.delete({ where: { id } });
        }
        catch (err) {
            if (err?.code === 'P2025')
                throw new common_1.NotFoundException('Roaster not found');
            throw err;
        }
    }
    async createRoaster(userId, data) {
        try {
            return await this.prisma.roaster.create({
                data: {
                    name: data.name,
                    location: data.location ?? null,
                    logoUrl: data.logoUrl ?? null,
                    contactEmail: data.contactEmail ?? null,
                    userId,
                },
            });
        }
        catch (err) {
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Roaster name already exists');
            throw err;
        }
    }
    async claimRoaster(roasterId, userId) {
        const roaster = await this.prisma.roaster.findUnique({
            where: { id: roasterId },
        });
        if (!roaster)
            throw new common_1.NotFoundException('Roaster not found');
        if (roaster.userId)
            throw new common_1.ConflictException('Roaster is already claimed');
        return await this.prisma.roaster.update({
            where: { id: roasterId },
            data: { userId },
        });
    }
    async getMyRoaster(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.roasterId)
            return null;
        return await this.prisma.roaster.findUnique({
            where: { id: user.roasterId },
            include: { coffees: true },
        });
    }
    async updateMyRoaster(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.roasterId)
            throw new common_1.NotFoundException('You have not claimed a roaster');
        const roaster = await this.prisma.roaster.findUnique({
            where: { id: user.roasterId },
        });
        if (!roaster)
            throw new common_1.NotFoundException('Roaster not found');
        try {
            return await this.prisma.roaster.update({
                where: { id: roaster.id },
                data,
                include: { coffees: true },
            });
        }
        catch (err) {
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Name already taken');
            throw err;
        }
    }
    async extractContactEmail(websiteUrl, websiteContent) {
        const email = await this.ai.extractContactEmailFromWebsite(websiteUrl, websiteContent);
        return { email };
    }
    async extractContactEmailByRoasterName(roasterName) {
        const email = await this.ai.extractContactEmailByRoasterName(roasterName);
        return { email };
    }
};
exports.RoastersService = RoastersService;
exports.RoastersService = RoastersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], RoastersService);
