import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type UserSummary = {
  id: string;
  name: string | null;
  photo: string | null;
};
export type RoasterSummary = {
  id: number;
  name: string;
  logoUrl: string | null;
};

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }
    try {
      return await this.prisma.userFollow.create({
        data: { followerId, followingId },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Already following this user');
      }
      throw error;
    }
  }

  async unfollowUser(followerId: string, followingId: string) {
    await this.prisma.userFollow.deleteMany({
      where: { followerId, followingId },
    });
  }

  async isFollowingUser(followerId: string, followingId: string) {
    const result = await this.prisma.userFollow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!result;
  }

  async getUserFollowCounts(userId: string) {
    const [followers, following] = await Promise.all([
      this.prisma.userFollow.count({ where: { followingId: userId } }),
      this.prisma.userFollow.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }

  async getUserFollowers(userId: string): Promise<UserSummary[]> {
    const follows = await this.prisma.userFollow.findMany({
      where: { followingId: userId },
      select: { follower: { select: { id: true, name: true, photo: true } } },
    });
    return follows.map((f: any) => f.follower);
  }

  async getUserFollowingUsers(userId: string): Promise<UserSummary[]> {
    const follows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { following: { select: { id: true, name: true, photo: true } } },
    });
    return follows.map((f: any) => f.following);
  }

  async getUserFollowingRoasters(userId: string): Promise<RoasterSummary[]> {
    const follows = await this.prisma.roasterFollow.findMany({
      where: { followerId: userId },
      select: {
        roaster: { select: { id: true, name: true, logoUrl: true } },
      },
    });
    return follows.map((f: any) => f.roaster);
  }

  async followRoaster(followerId: string, roasterId: number) {
    try {
      return await this.prisma.roasterFollow.create({
        data: { followerId, roasterId },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Already following this roaster');
      }
      throw error;
    }
  }

  async unfollowRoaster(followerId: string, roasterId: number) {
    await this.prisma.roasterFollow.deleteMany({
      where: { followerId, roasterId },
    });
  }

  async isFollowingRoaster(followerId: string, roasterId: number) {
    const result = await this.prisma.roasterFollow.findUnique({
      where: { followerId_roasterId: { followerId, roasterId } },
    });
    return !!result;
  }

  async getRoasterFollowerCount(roasterId: number) {
    return this.prisma.roasterFollow.count({ where: { roasterId } });
  }

  async getRoasterFollowers(roasterId: number): Promise<UserSummary[]> {
    const follows = await this.prisma.roasterFollow.findMany({
      where: { roasterId },
      select: { follower: { select: { id: true, name: true, photo: true } } },
    });
    return follows.map((f: any) => f.follower);
  }
}
