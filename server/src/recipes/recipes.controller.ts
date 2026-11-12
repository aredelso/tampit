import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { RecipesService, type RecipePayload } from './recipes.service';
import { extractUserId, extractToken } from '../auth/extract-user';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  @Get()
  findAll() {
    return this.recipes.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.recipes.findById(Number(id));
  }

  @Get('by-user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.recipes.findByUser(userId);
  }

  @Post()
  @HttpCode(201)
  create(@Body() body: RecipePayload, @Req() req: Request) {
    const token = extractToken(req);
    if (token.userType !== 'STANDARD')
      throw new ForbiddenException('Only standard users can create recipes');
    return this.recipes.create(body, token.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: RecipePayload,
    @Req() req: Request
  ) {
    const token = extractToken(req);
    if (token.userType !== 'STANDARD')
      throw new ForbiddenException('Only standard users can update recipes');
    return this.recipes.update(Number(id), body);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.recipes.delete(Number(id));
  }

  @Post(':id/likes')
  @HttpCode(204)
  likeRecipe(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.recipes.likeRecipe(Number(id), userId);
  }

  @Delete(':id/likes')
  @HttpCode(204)
  unlikeRecipe(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.recipes.unlikeRecipe(Number(id), userId);
  }
}
