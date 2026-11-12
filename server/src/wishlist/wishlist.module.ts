import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { WishlistResolver } from './wishlist.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WishlistService, WishlistResolver],
  controllers: [WishlistController],
})
export class WishlistModule {}
