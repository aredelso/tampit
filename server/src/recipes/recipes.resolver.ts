import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RecipesService, type RecipePayload } from './recipes.service';

@Resolver()
export class RecipesResolver {
  constructor(private readonly recipesService: RecipesService) {}

  @Query()
  async recipes() {
    return this.recipesService.findAll();
  }

  @Query()
  async recipe(@Args('id') id: number) {
    return this.recipesService.findById(id);
  }

  @Query()
  async userRecipes(@Args('userId') userId: string) {
    return this.recipesService.findByUser(userId);
  }

  @Mutation()
  @UseGuards(JwtGuard)
  async createRecipe(
    @Args('input') input: RecipePayload,
    @CurrentUser() user: any
  ) {
    if (user?.userType !== 'STANDARD')
      throw new ForbiddenException('Only standard users can create recipes');
    const userId = user?.id || user;
    return this.recipesService.create(input, userId);
  }

  @Mutation()
  @UseGuards(JwtGuard)
  async updateRecipe(
    @Args('id') id: number,
    @Args('input') input: RecipePayload,
    @CurrentUser() user: any
  ) {
    if (user?.userType !== 'STANDARD')
      throw new ForbiddenException('Only standard users can update recipes');
    return this.recipesService.update(id, input);
  }

  @Mutation()
  async deleteRecipe(@Args('id') id: number) {
    await this.recipesService.delete(id);
    return true;
  }

  @Mutation()
  @UseGuards(JwtGuard)
  async likeRecipe(
    @Args('recipeId') recipeId: number,
    @CurrentUser() user: any
  ) {
    const userId = user?.id || user;
    await this.recipesService.likeRecipe(recipeId, userId);
    return this.recipesService.findById(recipeId);
  }

  @Mutation()
  @UseGuards(JwtGuard)
  async unlikeRecipe(
    @Args('recipeId') recipeId: number,
    @CurrentUser() user: any
  ) {
    const userId = user?.id || user;
    await this.recipesService.unlikeRecipe(recipeId, userId);
    return this.recipesService.findById(recipeId);
  }
}
