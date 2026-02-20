import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-auth.guard';

@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(@Body() createDto: CreateMenuItemDto, @Request() req: any) {
    return this.menuItemsService.create(createDto, req.user?.userId);
  }

  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId') restaurantId: string, @Query() query: any) {
    return this.menuItemsService.findByRestaurant(restaurantId, query);
  }

  @Get('restaurant/:restaurantId/categories')
  getCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuItemsService.getCategories(restaurantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateDto: UpdateMenuItemDto, @Request() req: any) {
    return this.menuItemsService.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.menuItemsService.remove(id, req.user.userId);
  }
}
