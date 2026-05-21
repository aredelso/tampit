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
exports.RecipesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RecipesService = class RecipesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.include = {
            user: { select: { id: true, name: true, email: true, photo: true } },
            likes: {
                select: {
                    userId: true,
                    user: { select: { name: true } },
                },
            },
        };
    }
    mapRecipe(r) {
        return {
            id: r.id,
            title: r.title,
            description: r.description,
            instructions: r.instructions,
            brewMethod: r.brewMethod,
            grindSize: r.grindSize,
            phases: r.phases,
            brewTime: r.brewTime,
            dose: r.dose,
            waterMl: r.waterMl,
            notes: r.notes,
            userId: r.userId,
            userName: r.user?.name ?? null,
            userPhoto: r.user?.photo ?? null,
            likes: r.likes.length,
            likedBy: r.likes.map((l) => ({
                userId: l.userId,
                userName: l.user?.name ?? null,
            })),
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
        };
    }
    async findAll() {
        const recipes = await this.prisma.recipe.findMany({
            orderBy: { createdAt: 'desc' },
            include: this.include,
        });
        return recipes.map((r) => this.mapRecipe(r));
    }
    async findById(id) {
        const recipe = await this.prisma.recipe.findUnique({
            where: { id },
            include: this.include,
        });
        return recipe ? this.mapRecipe(recipe) : null;
    }
    async findByUser(userId) {
        const recipes = await this.prisma.recipe.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: this.include,
        });
        return recipes.map((r) => this.mapRecipe(r));
    }
    async create(payload, userId) {
        const recipe = await this.prisma.recipe.create({
            data: {
                title: payload.title,
                description: payload.description ?? null,
                instructions: payload.instructions ?? null,
                brewMethod: payload.brewMethod ?? null,
                grindSize: payload.grindSize ?? null,
                phases: payload.phases,
                brewTime: payload.brewTime ?? null,
                dose: payload.dose ?? null,
                waterMl: payload.waterMl ?? null,
                notes: payload.notes ?? null,
                userId,
            },
            include: this.include,
        });
        return this.mapRecipe(recipe);
    }
    async update(id, payload) {
        const recipe = await this.prisma.recipe.update({
            where: { id },
            data: {
                ...(payload.title && { title: payload.title }),
                ...(payload.description !== undefined && {
                    description: payload.description ?? null,
                }),
                ...(payload.instructions !== undefined && {
                    instructions: payload.instructions ?? null,
                }),
                ...(payload.brewMethod !== undefined && {
                    brewMethod: payload.brewMethod ?? null,
                }),
                ...(payload.grindSize !== undefined && {
                    grindSize: payload.grindSize ?? null,
                }),
                ...(payload.phases && { phases: payload.phases }),
                ...(payload.brewTime !== undefined && {
                    brewTime: payload.brewTime ?? null,
                }),
                ...(payload.dose !== undefined && {
                    dose: payload.dose ?? null,
                }),
                ...(payload.waterMl !== undefined && {
                    waterMl: payload.waterMl ?? null,
                }),
                ...(payload.notes !== undefined && { notes: payload.notes ?? null }),
                updatedAt: new Date(),
            },
            include: this.include,
        });
        return this.mapRecipe(recipe);
    }
    async delete(id) {
        await this.prisma.recipeLike.deleteMany({ where: { recipeId: id } });
        await this.prisma.recipe.delete({ where: { id } });
    }
    async likeRecipe(recipeId, userId) {
        try {
            await this.prisma.recipeLike.create({
                data: { recipeId, userId },
            });
        }
        catch (err) {
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Already liked');
            throw err;
        }
    }
    async unlikeRecipe(recipeId, userId) {
        await this.prisma.recipeLike.deleteMany({
            where: { recipeId, userId },
        });
    }
};
exports.RecipesService = RecipesService;
exports.RecipesService = RecipesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecipesService);
