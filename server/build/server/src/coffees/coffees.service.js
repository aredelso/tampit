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
exports.CoffeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CoffeesService = class CoffeesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.roasterSelect = {
            select: { id: true, name: true, logoUrl: true },
        };
    }
    async findAll(roasterId) {
        const coffees = await this.prisma.coffee.findMany({
            where: roasterId ? { roasterId } : undefined,
            orderBy: { name: 'asc' },
            include: { roaster: this.roasterSelect },
        });
        const coffeeWithStats = await Promise.all(coffees.map((coffee) => this.attachStatsToCoffee(coffee)));
        return coffeeWithStats;
    }
    async findByOrigin(origin) {
        const coffees = await this.prisma.coffee.findMany({
            where: { origin },
            include: { roaster: this.roasterSelect },
        });
        const coffeeWithStats = await Promise.all(coffees.map((coffee) => this.attachStatsToCoffee(coffee)));
        return coffeeWithStats.sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
    }
    async findOne(id) {
        const coffee = await this.prisma.coffee.findUnique({
            where: { id },
            include: { roaster: this.roasterSelect },
        });
        if (!coffee)
            throw new common_1.NotFoundException('Coffee not found');
        return this.attachStatsToCoffee(coffee);
    }
    async create(roasterId, name, origin, variety, farm, process, description, photoUrl) {
        try {
            return await this.prisma.coffee.create({
                data: { roasterId, name, origin, variety, farm, process, description, photoUrl },
                include: { roaster: this.roasterSelect },
            });
        }
        catch (err) {
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Coffee already exists for this roaster');
            throw err;
        }
    }
    async update(id, name, origin, variety, farm, process, description, photoUrl) {
        try {
            return await this.prisma.coffee.update({
                where: { id },
                data: { name, origin, variety, farm, process, description, photoUrl },
                include: { roaster: this.roasterSelect },
            });
        }
        catch (err) {
            if (err?.code === 'P2025')
                throw new common_1.NotFoundException('Coffee not found');
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Name already taken for this roaster');
            throw err;
        }
    }
    async remove(id) {
        try {
            await this.prisma.coffee.delete({ where: { id } });
        }
        catch (err) {
            if (err?.code === 'P2025')
                throw new common_1.NotFoundException('Coffee not found');
            throw err;
        }
    }
    async createForRoaster(userId, name, origin, variety, farm, process, description, photoUrl) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.roasterId)
            throw new common_1.NotFoundException('You have not claimed a roaster');
        const roaster = await this.prisma.roaster.findUnique({
            where: { id: user.roasterId },
        });
        if (!roaster)
            throw new common_1.NotFoundException('Roaster not found');
        try {
            return await this.prisma.coffee.create({
                data: {
                    roasterId: roaster.id,
                    name,
                    origin,
                    variety,
                    farm,
                    process,
                    description,
                    photoUrl,
                },
                include: { roaster: this.roasterSelect },
            });
        }
        catch (err) {
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Coffee already exists for this roaster');
            throw err;
        }
    }
    async updateForRoaster(userId, coffeeId, name, origin, variety, farm, process, description, photoUrl) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.roasterId)
            throw new common_1.NotFoundException('You have not claimed a roaster');
        const roaster = await this.prisma.roaster.findUnique({
            where: { id: user.roasterId },
        });
        if (!roaster)
            throw new common_1.NotFoundException('Roaster not found');
        const coffee = await this.prisma.coffee.findUnique({
            where: { id: coffeeId },
        });
        if (!coffee)
            throw new common_1.NotFoundException('Coffee not found');
        if (coffee.roasterId !== roaster.id)
            throw new common_1.ForbiddenException('This coffee is not in your roaster');
        try {
            return await this.prisma.coffee.update({
                where: { id: coffeeId },
                data: { name, origin, variety, farm, process, description, photoUrl },
                include: { roaster: this.roasterSelect },
            });
        }
        catch (err) {
            if (err?.code === 'P2025')
                throw new common_1.NotFoundException('Coffee not found');
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Name already taken for this roaster');
            throw err;
        }
    }
    async deleteForRoaster(userId, coffeeId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.roasterId)
            throw new common_1.NotFoundException('You have not claimed a roaster');
        const roaster = await this.prisma.roaster.findUnique({
            where: { id: user.roasterId },
        });
        if (!roaster)
            throw new common_1.NotFoundException('Roaster not found');
        const coffee = await this.prisma.coffee.findUnique({
            where: { id: coffeeId },
        });
        if (!coffee)
            throw new common_1.NotFoundException('Coffee not found');
        if (coffee.roasterId !== roaster.id)
            throw new common_1.ForbiddenException('This coffee is not in your roaster');
        try {
            await this.prisma.coffee.delete({ where: { id: coffeeId } });
        }
        catch (err) {
            if (err?.code === 'P2025')
                throw new common_1.NotFoundException('Coffee not found');
            throw err;
        }
    }
    async attachStatsToCoffee(coffee) {
        const stats = await this.prisma.coffeeEntry.aggregate({
            where: { coffeeId: coffee.id },
            _count: true,
            _avg: { rating: true },
        });
        return {
            ...coffee,
            entryCount: stats._count,
            avgRating: stats._avg.rating,
        };
    }
};
exports.CoffeesService = CoffeesService;
exports.CoffeesService = CoffeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoffeesService);
