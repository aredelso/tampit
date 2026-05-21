import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EntriesService } from './entries.service';

@Resolver()
@UseGuards(JwtGuard)
export class EntriesResolver {
  constructor(private readonly entriesService: EntriesService) {}

  @Mutation()
  async likeEntry(@Args('entryId') entryId: number, @CurrentUser() user: any) {
    const userId = user?.id || user;
    await this.entriesService.addLike(entryId, userId);
    return this.entriesService.findById(entryId);
  }

  @Mutation()
  async unlikeEntry(
    @Args('entryId') entryId: number,
    @CurrentUser() user: any
  ) {
    const userId = user?.id || user;
    await this.entriesService.removeLike(entryId, userId);
    return this.entriesService.findById(entryId);
  }

  @Mutation()
  async commentEntry(
    @Args('entryId') entryId: number,
    @Args('content') content: string,
    @CurrentUser() user: any
  ) {
    const userId = user?.id || user;
    await this.entriesService.addComment(entryId, userId, content);
    return this.entriesService.findById(entryId);
  }

  @Mutation()
  async likeComment(
    @Args('entryId') entryId: number,
    @Args('commentId') commentId: number,
    @CurrentUser() user: any
  ) {
    const userId = user?.id || user;
    await this.entriesService.addCommentLike(commentId, userId);
    return this.entriesService.findById(entryId);
  }

  @Mutation()
  async unlikeComment(
    @Args('entryId') entryId: number,
    @Args('commentId') commentId: number,
    @CurrentUser() user: any
  ) {
    const userId = user?.id || user;
    await this.entriesService.removeCommentLike(commentId, userId);
    return this.entriesService.findById(entryId);
  }
}
