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
import { RoastersService } from './roasters.service';
import { EntriesService } from '../entries/entries.service';

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
    @Body() body: { name?: string; location?: string; logoUrl?: string }
  ) {
    return this.roasters.update(Number(id), body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.roasters.remove(Number(id));
  }
}
