import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InventoryService, type InventoryPayload } from './inventory.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @UseGuards(JwtGuard)
  async getInventory(@CurrentUser() user: any) {
    const userId = user?.id || user;
    return this.inventoryService.findByUser(userId);
  }

  @Get(':coffeeId')
  @UseGuards(JwtGuard)
  async getInventoryItem(
    @Param('coffeeId') coffeeId: string,
    @CurrentUser() user: any
  ) {
    const userId = user?.id || user;
    return this.inventoryService.findByCoffee(Number(coffeeId), userId);
  }

  @Post()
  @UseGuards(JwtGuard)
  async addToInventory(
    @Body() payload: InventoryPayload,
    @CurrentUser() user: any
  ) {
    const userId = user?.id || user;
    return this.inventoryService.addToInventory(userId, payload);
  }

  @Put(':coffeeId')
  @UseGuards(JwtGuard)
  async updateInventory(
    @Param('coffeeId') coffeeId: string,
    @Body() payload: Partial<InventoryPayload>,
    @CurrentUser() user: any
  ) {
    const userId = user?.id || user;
    return this.inventoryService.updateInventory(
      userId,
      Number(coffeeId),
      payload
    );
  }

  @Delete(':coffeeId')
  @UseGuards(JwtGuard)
  async removeFromInventory(
    @Param('coffeeId') coffeeId: string,
    @CurrentUser() user: any
  ) {
    const userId = user?.id || user;
    await this.inventoryService.removeFromInventory(userId, Number(coffeeId));
    return { success: true };
  }
}
