import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { WishlistService } from './wishlist.service';

@Resolver('WishlistItem')
export class WishlistResolver {
  constructor(private readonly wishlistService: WishlistService) {}

  @Query('wishlist')
  @UseGuards(JwtGuard)
  async getWishlist(@CurrentUser() user: any) {
    const items = await this.wishlistService.getByUser(user.id);
    return items.map((item: any) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  @Query('isInWishlist')
  @UseGuards(JwtGuard)
  async isInWishlist(
    @CurrentUser() user: any,
    @Args('coffeeId') coffeeId: number
  ): Promise<boolean> {
    return this.wishlistService.isInWishlist(user.id, coffeeId);
  }

  @Mutation('addToWishlist')
  @UseGuards(JwtGuard)
  async addToWishlist(
    @CurrentUser() user: any,
    @Args('coffeeId') coffeeId: number
  ) {
    const item = await this.wishlistService.add(user.id, coffeeId);
    return {
      ...item,
      createdAt: item.createdAt.toISOString(),
    };
  }

  @Mutation('removeFromWishlist')
  @UseGuards(JwtGuard)
  async removeFromWishlist(
    @CurrentUser() user: any,
    @Args('coffeeId') coffeeId: number
  ): Promise<boolean> {
    const result = await this.wishlistService.remove(user.id, coffeeId);
    return result.count > 0;
  }
}
