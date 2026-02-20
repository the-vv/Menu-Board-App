import { IsNotEmpty, IsOptional, IsBoolean, IsArray, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsNumber()
  @Type(() => Number)
  lat: number;

  @IsNumber()
  @Type(() => Number)
  lng: number;
}

export class CreateRestaurantDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  phone?: string;

  @IsOptional()
  website?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
