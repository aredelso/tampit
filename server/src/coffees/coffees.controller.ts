import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffees: CoffeesService) {}

  @Get()
  findAll(@Query('roasterId') roasterId?: string) {
    return this.coffees.findAll(roasterId ? Number(roasterId) : undefined);
  }

  @Get('by-origin/:origin')
  findByOrigin(@Param('origin') origin: string) {
    return this.coffees.findByOrigin(decodeURIComponent(origin));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coffees.findOne(Number(id));
  }

  @Post()
  @HttpCode(201)
  create(
    @Body()
    body: {
      roasterId?: number;
      name?: string;
      origin?: string;
      process?: string;
      description?: string;
      photoUrl?: string;
    }
  ) {
    if (!body.roasterId) throw new BadRequestException('roasterId required');
    if (!body.name) throw new BadRequestException('name required');
    return this.coffees.create(
      body.roasterId,
      body.name,
      body.origin,
      body.process,
      body.description,
      body.photoUrl
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      origin?: string;
      process?: string;
      description?: string;
      photoUrl?: string;
    }
  ) {
    if (!body.name) throw new BadRequestException('name required');
    return this.coffees.update(
      Number(id),
      body.name,
      body.origin,
      body.process,
      body.description,
      body.photoUrl
    );
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.coffees.remove(Number(id));
  }
}
