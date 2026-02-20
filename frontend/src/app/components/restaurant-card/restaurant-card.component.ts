import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, timeOutline } from 'ionicons/icons';
import { Restaurant } from '../../models';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow active:bg-gray-50">
      <div class="flex items-start gap-3">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
             [class]="getTypeColor()">
          {{ getTypeEmoji() }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-gray-900 truncate">{{ restaurant.name }}</h3>
            @if (!restaurant.isPublic) {
              <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shrink-0">Private</span>
            }
          </div>
          @if (restaurant.description) {
            <p class="text-sm text-gray-500 mt-0.5 line-clamp-1">{{ restaurant.description }}</p>
          }
          @if (restaurant.address) {
            <div class="flex items-center gap-1 mt-1">
              <ion-icon name="location-outline" class="text-gray-400 text-xs"></ion-icon>
              <span class="text-xs text-gray-400 truncate">{{ restaurant.address }}</span>
            </div>
          }
          @if (restaurant.tags?.length) {
            <div class="flex gap-1 mt-2 flex-wrap">
              @for (tag of restaurant.tags?.slice(0, 3); track tag) {
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{{ tag }}</span>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class RestaurantCardComponent {
  @Input() restaurant!: Restaurant;

  constructor() {
    addIcons({ locationOutline, timeOutline });
  }

  getTypeEmoji(): string {
    const map: Record<string, string> = {
      restaurant: '🍽️', cafe: '☕', teashop: '🍵', other: '🏪'
    };
    return map[this.restaurant.type] || '🍽️';
  }

  getTypeColor(): string {
    const map: Record<string, string> = {
      restaurant: 'bg-orange-100', cafe: 'bg-amber-100', teashop: 'bg-green-100', other: 'bg-gray-100'
    };
    return map[this.restaurant.type] || 'bg-gray-100';
  }
}
