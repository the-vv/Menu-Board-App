import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(@InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>) {}

  async create(createDto: CreateMenuItemDto, userId?: string): Promise<any> {
    const itemData: any = {
      ...createDto,
      restaurantId: new Types.ObjectId(createDto.restaurantId),
    };
    if (userId) itemData.createdBy = new Types.ObjectId(userId);
    const item = new this.menuItemModel(itemData);
    return item.save();
  }

  async findByRestaurant(restaurantId: string, query: any = {}): Promise<any[]> {
    const filter: any = { restaurantId: new Types.ObjectId(restaurantId) };
    if (query.category) filter.category = query.category;
    if (query.search) filter.$text = { $search: query.search };
    return this.menuItemModel.find(filter).sort({ category: 1, name: 1 }).lean();
  }

  async findOne(id: string): Promise<any> {
    const item = await this.menuItemModel.findById(id).lean();
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async update(id: string, updateDto: UpdateMenuItemDto, userId: string): Promise<any> {
    const item = await this.menuItemModel.findById(id);
    if (!item) throw new NotFoundException('Menu item not found');
    // Any authenticated user can edit — no ownership required
    return this.menuItemModel.findByIdAndUpdate(id, updateDto, { new: true }).lean();
  }

  async remove(id: string, userId: string): Promise<void> {
    const item = await this.menuItemModel.findById(id);
    if (!item) throw new NotFoundException('Menu item not found');
    // Any authenticated user can delete — no ownership required
    await this.menuItemModel.findByIdAndDelete(id);
  }

  async getCategories(restaurantId: string): Promise<string[]> {
    const items = await this.menuItemModel.distinct('category', {
      restaurantId: new Types.ObjectId(restaurantId),
    });
    return items.filter(Boolean);
  }
}
