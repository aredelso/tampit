import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('coffees/:coffeeId')
  @UseGuards(JwtGuard)
  async addToWishlist(
    @Request() req: { user: { id: string } },
    @Param('coffeeId') coffeeId: string,
  ) {
    return this.wishlistService.add(req.user.id, parseInt(coffeeId));
  }

  @Delete('coffees/:coffeeId')
  @UseGuards(JwtGuard)
  async removeFromWishlist(
    @Request() req: { user: { id: string } },
    @Param('coffeeId') coffeeId: string,
  ) {
    return this.wishlistService.remove(req.user.id, parseInt(coffeeId));
  }

  @Get()
  @UseGuards(JwtGuard)
  async getWishlist(@Request() req: { user: { id: string } }) {
    return this.wishlistService.getByUser(req.user.id);
  }

  @Get('coffees/:coffeeId/check')
  @UseGuards(JwtGuard)
  async checkInWishlist(
    @Request() req: { user: { id: string } },
    @Param('coffeeId') coffeeId: string,
  ) {
    const inWishlist = await this.wishlistService.isInWishlist(
      req.user.id,
      parseInt(coffeeId),
    );
    return { inWishlist };
  }
}
