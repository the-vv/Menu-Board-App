import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  address: string;

  @Prop({ type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: [0, 0] } })
  location: { type: string; coordinates: number[] };

  @Prop()
  phone: string;

  @Prop()
  website: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop()
  imageUrl: string;

  @Prop({ type: String, enum: ['restaurant', 'cafe', 'teashop', 'other'], default: 'restaurant' })
  type: string;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
RestaurantSchema.index({ location: '2dsphere' });
RestaurantSchema.index({ name: 'text', description: 'text', address: 'text' });
