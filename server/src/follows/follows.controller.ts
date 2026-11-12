import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FollowsService } from './follows.service';
import { extractUserId } from '../auth/extract-user';

@Controller('follows')
export class FollowsController {
  constructor(private readonly follows: FollowsService) {}

  @Post('users/:targetId')
  @HttpCode(201)
  async followUser(@Param('targetId') targetId: string, @Req() req: Request) {
    const followerId = extractUserId(req);
    await this.follows.followUser(followerId, targetId);
    return { followerId, followingId: targetId };
  }

  @Delete('users/:targetId')
  @HttpCode(204)
  async unfollowUser(@Param('targetId') targetId: string, @Req() req: Request) {
    const followerId = extractUserId(req);
    await this.follows.unfollowUser(followerId, targetId);
  }

  @Get('users/:targetId/status')
  async userFollowStatus(
    @Param('targetId') targetId: string,
    @Req() req: Request,
  ) {
    const followerId = extractUserId(req);
    const following = await this.follows.isFollowingUser(followerId, targetId);
    return { following };
  }

  @Get('users/:targetId/counts')
  async userFollowCounts(@Param('targetId') targetId: string) {
    return this.follows.getUserFollowCounts(targetId);
  }

  @Get('users/:targetId/followers')
  async userFollowers(@Param('targetId') targetId: string) {
    return this.follows.getUserFollowers(targetId);
  }

  @Get('users/:targetId/following/users')
  async userFollowingUsers(@Param('targetId') targetId: string) {
    return this.follows.getUserFollowingUsers(targetId);
  }

  @Get('users/:targetId/following/roasters')
  async userFollowingRoasters(@Param('targetId') targetId: string) {
    return this.follows.getUserFollowingRoasters(targetId);
  }

  @Post('roasters/:roasterId')
  @HttpCode(201)
  async followRoaster(
    @Param('roasterId') roasterId: string,
    @Req() req: Request,
  ) {
    const followerId = extractUserId(req);
    await this.follows.followRoaster(followerId, Number(roasterId));
    return { followerId, roasterId: Number(roasterId) };
  }

  @Delete('roasters/:roasterId')
  @HttpCode(204)
  async unfollowRoaster(
    @Param('roasterId') roasterId: string,
    @Req() req: Request,
  ) {
    const followerId = extractUserId(req);
    await this.follows.unfollowRoaster(followerId, Number(roasterId));
  }

  @Get('roasters/:roasterId/status')
  async roasterFollowStatus(
    @Param('roasterId') roasterId: string,
    @Req() req: Request,
  ) {
    const followerId = extractUserId(req);
    const following = await this.follows.isFollowingRoaster(
      followerId,
      Number(roasterId),
    );
    return { following };
  }

  @Get('roasters/:roasterId/counts')
  async roasterFollowCounts(@Param('roasterId') roasterId: string) {
    const followers = await this.follows.getRoasterFollowerCount(
      Number(roasterId),
    );
    return { followers };
  }

  @Get('roasters/:roasterId/followers')
  async roasterFollowers(@Param('roasterId') roasterId: string) {
    return this.follows.getRoasterFollowers(Number(roasterId));
  }
}
