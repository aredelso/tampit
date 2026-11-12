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
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CoffeesService } from './coffees.service';
import { extractUserId } from '../auth/extract-user';

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
      variety?: string;
      farm?: string;
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
      body.variety,
      body.farm,
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
      variety?: string;
      farm?: string;
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
      body.variety,
      body.farm,
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

  @Post('my/create')
  @HttpCode(201)
  createForMyRoaster(
    @Req() req: Request,
    @Body()
    body: {
      name?: string;
      origin?: string;
      variety?: string;
      farm?: string;
      process?: string;
      description?: string;
      photoUrl?: string;
    }
  ) {
    if (!body.name) throw new BadRequestException('name required');
    const userId = extractUserId(req);
    return this.coffees.createForRoaster(
      userId,
      body.name,
      body.origin,
      body.variety,
      body.farm,
      body.process,
      body.description,
      body.photoUrl
    );
  }

  @Put('my/:id')
  updateForMyRoaster(
    @Param('id') id: string,
    @Req() req: Request,
    @Body()
    body: {
      name?: string;
      origin?: string;
      variety?: string;
      farm?: string;
      process?: string;
      description?: string;
      photoUrl?: string;
    }
  ) {
    if (!body.name) throw new BadRequestException('name required');
    const userId = extractUserId(req);
    return this.coffees.updateForRoaster(
      userId,
      Number(id),
      body.name,
      body.origin,
      body.variety,
      body.farm,
      body.process,
      body.description,
      body.photoUrl
    );
  }

  @Delete('my/:id')
  @HttpCode(204)
  deleteForMyRoaster(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.coffees.deleteForRoaster(userId, Number(id));
  }
}
