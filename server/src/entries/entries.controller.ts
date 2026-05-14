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
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { EntriesService, EntryBody } from './entries.service';
import { extractUserId } from '../auth/extract-user';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entries: EntriesService) {}

  @Get()
  findAll() {
    return this.entries.findAll();
  }

  @Get('by-tag/:tag')
  findByTag(@Param('tag') tag: string) {
    return this.entries.findByFlavorNote(tag);
  }

  @Get('by-coffee/:coffeeId')
  findByCoffee(@Param('coffeeId') coffeeId: string) {
    return this.entries.findByCoffee(Number(coffeeId));
  }

  @Post()
  @HttpCode(201)
  create(@Body() body: EntryBody) {
    return this.entries.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: EntryBody) {
    return this.entries.update(Number(id), body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.entries.remove(Number(id));
  }

  @Post(':id/likes')
  @HttpCode(204)
  addLike(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.entries.addLike(Number(id), userId);
  }

  @Delete(':id/likes')
  @HttpCode(204)
  removeLike(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.entries.removeLike(Number(id), userId);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.entries.getComments(Number(id));
  }

  @Post(':id/comments')
  @HttpCode(201)
  addComment(
    @Param('id') id: string,
    @Body() body: { content?: string },
    @Req() req: Request
  ) {
    if (!body.content) throw new BadRequestException('content required');
    const userId = extractUserId(req);
    return this.entries.addComment(Number(id), userId, body.content);
  }

  @Post(':id/comments/:commentId/likes')
  @HttpCode(204)
  addCommentLike(@Param('commentId') commentId: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.entries.addCommentLike(Number(commentId), userId);
  }

  @Delete(':id/comments/:commentId/likes')
  @HttpCode(204)
  removeCommentLike(
    @Param('commentId') commentId: string,
    @Req() req: Request
  ) {
    const userId = extractUserId(req);
    return this.entries.removeCommentLike(Number(commentId), userId);
  }
}
