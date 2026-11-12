import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { RecipesResolver } from './recipes.resolver';

@Module({
  controllers: [RecipesController],
  providers: [RecipesService, RecipesResolver],
  exports: [RecipesService],
})
export class RecipesModule {}
