"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedController = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
const seed_data_1 = require("./seed.data");
let SeedController = class SeedController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async seed() {
        await this.prisma.commentLike.deleteMany({});
        await this.prisma.comment.deleteMany({});
        await this.prisma.like.deleteMany({});
        await this.prisma.recipeLike.deleteMany({});
        await this.prisma.recipe.deleteMany({});
        await this.prisma.coffeeEntry.deleteMany({});
        await this.prisma.coffee.deleteMany({});
        await this.prisma.roaster.deleteMany({});
        await this.prisma.user.deleteMany({});
        // Create all roasters
        await this.prisma.roaster.createMany({
            data: seed_data_1.ROASTERS.map((r) => ({
                name: r.name,
                location: r.location ?? null,
                logoUrl: r.logoUrl ?? null,
            })),
            skipDuplicates: true,
        });
        const roasters = await this.prisma.roaster.findMany();
        const roasterByName = Object.fromEntries(roasters.map((r) => [r.name, r]));
        // Users
        const devHash = await bcrypt.hash('password', 10);
        const dev = await this.prisma.user.create({
            data: {
                name: 'Dev',
                email: 'dev@dev.com',
                passwordHash: devHash,
                photo: 'https://i.pravatar.cc/150?u=dev@dev.com',
                userType: 'STANDARD',
                verified: true,
            },
        });
        const alice = await this.prisma.user.create({
            data: {
                name: 'Alice',
                email: 'alice@example.com',
                photo: 'https://i.pravatar.cc/150?u=alice@example.com',
                userType: 'ROASTER',
                verified: true,
            },
        });
        const bob = await this.prisma.user.create({
            data: {
                name: 'Bob',
                email: 'bob@example.com',
                photo: 'https://i.pravatar.cc/150?u=bob@example.com',
                userType: 'STANDARD',
                verified: true,
            },
        });
        const userByName = { dev, alice, bob };
        // Entries
        const entries = [];
        for (const e of seed_data_1.ENTRIES) {
            const roaster = roasterByName[e.roaster];
            if (!roaster)
                continue;
            const coffee = await this.prisma.coffee.upsert({
                where: { name_roasterId: { name: e.coffee, roasterId: roaster.id } },
                update: {
                    process: e.process ?? null,
                    description: e.description ?? null,
                    photoUrl: e.coffeePhoto ?? null,
                },
                create: {
                    name: e.coffee,
                    origin: e.origin,
                    process: e.process ?? null,
                    description: e.description ?? null,
                    photoUrl: e.coffeePhoto ?? null,
                    roasterId: roaster.id,
                },
            });
            const entry = await this.prisma.coffeeEntry.create({
                data: {
                    roasterId: roaster.id,
                    coffeeId: coffee.id,
                    origin: e.origin,
                    brewMethod: e.brewMethod,
                    dose: e.dose,
                    waterMl: e.waterMl,
                    notes: e.notes,
                    rating: e.rating,
                    photoUrl: e.photo
                        ? `https://picsum.photos/seed/${e.photo}/800/500`
                        : null,
                    flavorNotes: e.flavorNotes,
                    userId: userByName[e.user].id,
                },
            });
            entries.push(entry);
        }
        // Likes
        const likeTargets = entries.slice(0, 10);
        for (const [i, entry] of likeTargets.entries()) {
            const liker = i % 3 === 0 ? alice : i % 3 === 1 ? bob : dev;
            if (liker.id !== entry.userId) {
                await this.prisma.like.create({
                    data: { entryId: entry.id, userId: liker.id },
                });
            }
        }
        // Comments
        await this.prisma.comment.create({
            data: {
                entryId: entries[1].id,
                userId: dev.id,
                content: 'What grind size?',
            },
        });
        await this.prisma.comment.create({
            data: { entryId: entries[1].id, userId: bob.id, content: 'Gorgeous!' },
        });
        await this.prisma.comment.create({
            data: {
                entryId: entries[2].id,
                userId: alice.id,
                content: 'That natural process 🤌',
            },
        });
        await this.prisma.comment.create({
            data: {
                entryId: entries[5].id,
                userId: alice.id,
                content: 'Tim Wendelboe never misses',
            },
        });
        // Recipes
        const recipes = [];
        for (const r of seed_data_1.RECIPES) {
            const recipe = await this.prisma.recipe.create({
                data: {
                    title: r.title,
                    description: r.description,
                    instructions: r.instructions,
                    brewMethod: r.brewMethod ?? null,
                    grindSize: r.grindSize ?? null,
                    phases: r.phases,
                    brewTime: r.brewTime,
                    dose: r.dose,
                    waterMl: r.waterMl,
                    notes: r.notes,
                    userId: userByName[r.user].id,
                },
            });
            recipes.push(recipe);
        }
        // Recipe likes
        const recipeLikeTargets = recipes.slice(0, 3);
        for (const [i, recipe] of recipeLikeTargets.entries()) {
            const liker = i % 3 === 0 ? alice : i % 3 === 1 ? bob : dev;
            if (liker.id !== recipe.userId) {
                await this.prisma.recipeLike.create({
                    data: { recipeId: recipe.id, userId: liker.id },
                });
            }
        }
        return {
            message: 'Seeded',
            roasters: roasters.length,
            entries: entries.length,
            recipes: recipes.length,
        };
    }
};
exports.SeedController = SeedController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeedController.prototype, "seed", null);
exports.SeedController = SeedController = __decorate([
    (0, common_1.Controller)('dev/seed'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeedController);
