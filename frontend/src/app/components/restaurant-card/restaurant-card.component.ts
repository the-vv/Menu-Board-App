import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline, restaurantOutline, cafeOutline,
  leafOutline, storefrontOutline, lockClosedOutline
} from 'ionicons/icons';
import { Restaurant } from '../../models';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <div class="bg-gray-800 rounded-2xl border border-gray-700/60 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform shadow-md">
      <!-- Accent bar -->
      <div class="h-1 w-full" [class]="getAccentColor()"></div>
      <div class="p-4">
        <div class="flex items-start gap-3">
          <!-- Icon badge -->
          <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5" [class]="getIconBg()">
            <ion-icon [name]="getTypeIcon()" class="text-xl" [class]="getIconColor()"></ion-icon>
          </div>
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-semibold text-white text-base leading-snug truncate">{{ restaurant.name }}</h3>
              <div class="flex items-center gap-1 shrink-0">
                @if (!restaurant.isPublic) {
                  <ion-icon name="lock-closed-outline" class="text-gray-500 text-xs"></ion-icon>
                }
                <span class="text-xs font-medium capitalize px-2 py-0.5 rounded-full" [class]="getTypeBadge()">
                  {{ restaurant.type }}
                </span>
              </div>
            </div>
            @if (restaurant.description) {
              <p class="text-sm text-gray-400 mt-1 line-clamp-2 leading-snug">{{ restaurant.description }}</p>
            }
            @if (restaurant.address) {
              <div class="flex items-center gap-1.5 mt-2">
                <ion-icon name="location-outline" class="text-gray-500 text-xs shrink-0"></ion-icon>
                <span class="text-xs text-gray-500 truncate">{{ restaurant.address }}</span>
              </div>
            }
            @if (restaurant.tags?.length) {
              <div class="flex gap-1.5 mt-2 flex-wrap">
                @for (tag of restaurant.tags?.slice(0, 3); track tag) {
                  <span class="text-xs bg-gray-700/70 text-gray-300 px-2 py-0.5 rounded-full border border-gray-600/50">{{ tag }}</span>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class RestaurantCardComponent {
  @Input() restaurant!: Restaurant;

  constructor() {
    addIcons({ locationOutline, restaurantOutline, cafeOutline, leafOutline, storefrontOutline, lockClosedOutline });
  }

  getTypeIcon(): string {
    const map: Record<string, string> = {
      restaurant: 'restaurant-outline',
      cafe: 'cafe-outline',
      teashop: 'leaf-outline',
      other: 'storefront-outline'
    };
    return map[this.restaurant.type] || 'storefront-outline';
  }

  getAccentColor(): string {
    const map: Record<string, string> = {
      restaurant: 'bg-orange-500',
      cafe: 'bg-amber-500',
      teashop: 'bg-green-500',
      other: 'bg-teal-500'
    };
    return map[this.restaurant.type] || 'bg-teal-500';
  }

  getIconBg(): string {
    const map: Record<string, string> = {
      restaurant: 'bg-orange-900/40',
      cafe: 'bg-amber-900/40',
      teashop: 'bg-green-900/40',
      other: 'bg-teal-900/40'
    };
    return map[this.restaurant.type] || 'bg-teal-900/40';
  }

  getIconColor(): string {
    const map: Record<string, string> = {
      restaurant: 'text-orange-400',
      cafe: 'text-amber-400',
      teashop: 'text-green-400',
      other: 'text-teal-400'
    };
    return map[this.restaurant.type] || 'text-teal-400';
  }

  getTypeBadge(): string {
    const map: Record<string, string> = {
      restaurant: 'bg-orange-900/30 text-orange-300',
      cafe: 'bg-amber-900/30 text-amber-300',
      teashop: 'bg-green-900/30 text-green-300',
      other: 'bg-teal-900/30 text-teal-300'
    };
    return map[this.restaurant.type] || 'bg-teal-900/30 text-teal-300';
  }
}
