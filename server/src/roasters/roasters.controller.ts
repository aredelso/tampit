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
import { RoastersService } from './roasters.service';
import { EntriesService } from '../entries/entries.service';
import { extractUserId } from '../auth/extract-user';

@Controller('roasters')
export class RoastersController {
  constructor(
    private readonly roasters: RoastersService,
    private readonly entries: EntriesService
  ) {}

  @Get()
  findAll(@Query('search') search?: string) {
    if (search) return this.roasters.findByName(search);
    return this.roasters.findAll();
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.roasters.findOne(Number(id));
  }

  @Get(':id/entries')
  getEntries(@Param('id') id: string) {
    return this.entries.findByRoaster(Number(id));
  }

  @Post()
  @HttpCode(201)
  create(@Body() body: { name?: string }) {
    if (!body.name) throw new BadRequestException('name is required');
    return this.roasters.create(body.name);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      location?: string;
      logoUrl?: string;
      contactEmail?: string;
    }
  ) {
    return this.roasters.update(Number(id), body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.roasters.remove(Number(id));
  }

  @Get('my/profile')
  getMyRoaster(@Req() req: Request) {
    const userId = extractUserId(req);
    return this.roasters.getMyRoaster(userId);
  }

  @Post('my/create')
  @HttpCode(201)
  createMyRoaster(
    @Req() req: Request,
    @Body()
    body: {
      name?: string;
      location?: string;
      logoUrl?: string;
      contactEmail?: string;
    }
  ) {
    if (!body.name) throw new BadRequestException('name is required');
    const userId = extractUserId(req);
    return this.roasters.createRoaster(userId, {
      name: body.name,
      location: body.location,
      logoUrl: body.logoUrl,
      contactEmail: body.contactEmail,
    });
  }

  @Post(':id/claim')
  claimRoaster(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.roasters.claimRoaster(Number(id), userId);
  }

  @Put('my/profile')
  updateMyRoaster(
    @Req() req: Request,
    @Body()
    body: {
      name?: string;
      location?: string;
      logoUrl?: string;
      contactEmail?: string;
    }
  ) {
    const userId = extractUserId(req);
    return this.roasters.updateMyRoaster(userId, body);
  }

  @Post('extract-contact-email')
  extractContactEmail(
    @Body() body: { websiteUrl?: string; websiteContent?: string }
  ) {
    return this.roasters.extractContactEmail(
      body.websiteUrl,
      body.websiteContent
    );
  }

  @Post('extract-contact-email-by-name')
  extractContactEmailByName(@Body() body: { roasterName?: string }) {
    if (!body.roasterName)
      throw new BadRequestException('roasterName is required');
    return this.roasters.extractContactEmailByRoasterName(body.roasterName);
  }
}
