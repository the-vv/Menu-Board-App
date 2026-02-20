import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(@InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>) {}

  async create(createDto: CreateRestaurantDto, userId?: string): Promise<any> {
    const restaurantData: any = { ...createDto };
    if (createDto.location) {
      restaurantData.location = {
        type: 'Point',
        coordinates: [createDto.location.lng, createDto.location.lat],
      };
    }
    if (userId) restaurantData.createdBy = new Types.ObjectId(userId);
    const restaurant = new this.restaurantModel(restaurantData);
    return restaurant.save();
  }

  async findAll(query: any = {}, userId?: string): Promise<any[]> {
    const filter: any = {};
    if (!userId) {
      filter.isPublic = true;
    } else {
      filter.$or = [{ isPublic: true }, { createdBy: new Types.ObjectId(userId) }];
    }
    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.type) {
      filter.type = query.type;
    }
    return this.restaurantModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  async findNearby(lat: number, lng: number, maxDistance: number = 5000, userId?: string): Promise<any[]> {
    const filter: any = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    };
    if (!userId) {
      filter.isPublic = true;
    } else {
      filter.$or = [{ isPublic: true }, { createdBy: new Types.ObjectId(userId) }];
    }
    return this.restaurantModel.find(filter).lean();
  }

  async findOne(id: string): Promise<any> {
    const restaurant = await this.restaurantModel.findById(id).lean();
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async update(id: string, updateDto: UpdateRestaurantDto, userId: string): Promise<any> {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.createdBy?.toString() !== userId) throw new ForbiddenException('Not authorized');
    const updateData: any = { ...updateDto };
    if (updateDto.location) {
      updateData.location = {
        type: 'Point',
        coordinates: [updateDto.location.lng, updateDto.location.lat],
      };
    }
    return this.restaurantModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async remove(id: string, userId: string): Promise<void> {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.createdBy?.toString() !== userId) throw new ForbiddenException('Not authorized');
    await this.restaurantModel.findByIdAndDelete(id);
  }

  async findByUser(userId: string): Promise<any[]> {
    return this.restaurantModel.find({ createdBy: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
  }
}
