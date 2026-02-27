import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-auth.guard';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateRestaurantDto, @Request() req: any) {
    return this.restaurantsService.create(createDto, req.user?.userId);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() query: any, @Request() req: any) {
    return this.restaurantsService.findAll(query, req.user?.userId);
  }

  @Get('nearby')
  @UseGuards(OptionalJwtAuthGuard)
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('distance') distance: string,
    @Query('search') search: string,
    @Query('type') type: string,
    @Request() req: any,
  ) {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return { error: 'lat and lng query parameters must be valid numbers' };
    }
    return this.restaurantsService.findNearby(
      parsedLat,
      parsedLng,
      distance ? parseInt(distance) : 5000,
      req.user?.userId,
      { search, type },
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyRestaurants(@Request() req: any) {
    return this.restaurantsService.findByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateDto: UpdateRestaurantDto, @Request() req: any) {
    return this.restaurantsService.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.restaurantsService.remove(id, req.user.userId);
  }
}
