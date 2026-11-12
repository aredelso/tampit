import { Controller, Get, Param } from '@nestjs/common';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tags: TagsService) {}

  @Get()
  findAll() {
    return this.tags.findAll();
  }

  @Get('coffee/:coffeeId')
  topForCoffee(@Param('coffeeId') coffeeId: string) {
    return this.tags.topForCoffee(Number(coffeeId));
  }
}
