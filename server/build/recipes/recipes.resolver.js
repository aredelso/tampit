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
exports.RecipesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const recipes_service_1 = require("./recipes.service");
let RecipesResolver = class RecipesResolver {
    constructor(recipesService) {
        this.recipesService = recipesService;
    }
    async recipes() {
        return this.recipesService.findAll();
    }
    async recipe(id) {
        return this.recipesService.findById(id);
    }
    async userRecipes(userId) {
        return this.recipesService.findByUser(userId);
    }
    async createRecipe(input, user) {
        if (user?.userType !== 'STANDARD')
            throw new common_1.ForbiddenException('Only standard users can create recipes');
        const userId = user?.id || user;
        return this.recipesService.create(input, userId);
    }
    async updateRecipe(id, input, user) {
        if (user?.userType !== 'STANDARD')
            throw new common_1.ForbiddenException('Only standard users can update recipes');
        return this.recipesService.update(id, input);
    }
    async deleteRecipe(id) {
        await this.recipesService.delete(id);
        return true;
    }
    async likeRecipe(recipeId, user) {
        const userId = user?.id || user;
        await this.recipesService.likeRecipe(recipeId, userId);
        return this.recipesService.findById(recipeId);
    }
    async unlikeRecipe(recipeId, user) {
        const userId = user?.id || user;
        await this.recipesService.unlikeRecipe(recipeId, userId);
        return this.recipesService.findById(recipeId);
    }
};
exports.RecipesResolver = RecipesResolver;
__decorate([
    (0, graphql_1.Query)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecipesResolver.prototype, "recipes", null);
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RecipesResolver.prototype, "recipe", null);
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, graphql_1.Args)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecipesResolver.prototype, "userRecipes", null);
__decorate([
    (0, graphql_1.Mutation)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecipesResolver.prototype, "createRecipe", null);
__decorate([
    (0, graphql_1.Mutation)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], RecipesResolver.prototype, "updateRecipe", null);
__decorate([
    (0, graphql_1.Mutation)(),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RecipesResolver.prototype, "deleteRecipe", null);
__decorate([
    (0, graphql_1.Mutation)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, graphql_1.Args)('recipeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RecipesResolver.prototype, "likeRecipe", null);
__decorate([
    (0, graphql_1.Mutation)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, graphql_1.Args)('recipeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RecipesResolver.prototype, "unlikeRecipe", null);
exports.RecipesResolver = RecipesResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [recipes_service_1.RecipesService])
], RecipesResolver);
