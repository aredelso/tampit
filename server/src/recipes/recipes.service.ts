import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type RecipePhase = {
  name: string;
  waterAmount?: number;
  waterTemp?: number;
  startTime?: number;
  notes?: string;
  grindSize?: string;
};

export type RecipePayload = {
  title: string;
  description?: string;
  brewMethod?: string;
  grindSize?: string;
  phases?: RecipePhase[];
  dose?: number;
  waterMl?: number;
  brewTime?: number;
  notes?: string;
};

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapRecipe(r: any) {
    return {
      id: r.id,
      title: r.title,
      description: r.description,
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
      likedBy: r.likes.map((l: any) => ({
        userId: l.userId,
        userName: l.user?.name ?? null,
      })),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  private readonly include = {
    user: { select: { id: true, name: true, email: true, photo: true } },
    likes: {
      select: {
        userId: true,
        user: { select: { name: true } },
      },
    },
  };

  async findAll() {
    const recipes = await this.prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.include,
    });
    return recipes.map((r: any) => this.mapRecipe(r));
  }

  async findById(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: this.include,
    });
    return recipe ? this.mapRecipe(recipe) : null;
  }

  async findByUser(userId: string) {
    const recipes = await this.prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: this.include,
    });
    return recipes.map((r: any) => this.mapRecipe(r));
  }

  async create(payload: RecipePayload, userId: string) {
    const recipe = await this.prisma.recipe.create({
      data: {
        title: payload.title,
        description: payload.description ?? null,
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

  async update(id: number, payload: RecipePayload) {
    const recipe = await this.prisma.recipe.update({
      where: { id },
      data: {
        ...(payload.title && { title: payload.title }),
        ...(payload.description !== undefined && {
          description: payload.description ?? null,
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

  async delete(id: number) {
    await this.prisma.recipeLike.deleteMany({ where: { recipeId: id } });
    await this.prisma.recipe.delete({ where: { id } });
  }

  async likeRecipe(recipeId: number, userId: string) {
    try {
      await this.prisma.recipeLike.create({
        data: { recipeId, userId },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') throw new ConflictException('Already liked');
      throw err;
    }
  }

  async unlikeRecipe(recipeId: number, userId: string) {
    await this.prisma.recipeLike.deleteMany({
      where: { recipeId, userId },
    });
  }
}
