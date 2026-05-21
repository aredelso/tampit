import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { EntriesService } from '../entries/entries.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly entries: EntriesService
  ) {}

  @Post()
  @HttpCode(201)
  create(
    @Body() body: { name?: string; email?: string; roasterId?: number | null }
  ) {
    return this.users.create(
      body.name ?? null,
      body.email ?? null,
      body.roasterId ?? null
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Get(':id/coffees')
  findCoffees(@Param('id') id: string) {
    return this.users.findCoffees(id);
  }

  @Get(':id/entries')
  findEntries(@Param('id') id: string) {
    return this.entries.findByUser(id);
  }
}
