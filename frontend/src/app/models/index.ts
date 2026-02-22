export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Location {
  type: string;
  coordinates: number[]; // [lng, lat]
}

export interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  location?: Location;
  phone?: string;
  website?: string;
  tags?: string[];
  isPublic: boolean;
  createdBy?: string;
  imageUrl?: string;
  type: 'restaurant' | 'cafe' | 'teashop' | 'other';
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdBy?: string;
  createdAt?: string;
}
