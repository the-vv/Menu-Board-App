import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonSearchbar,
  IonRefresher, IonRefresherContent, IonFab, IonFabButton,
  IonSpinner, IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, locationOutline, searchOutline, personOutline,
  restaurantOutline, cafeOutline, logInOutline, refreshOutline,
  navigateOutline, starOutline
} from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';
import { Restaurant } from '../../models';
import { RestaurantCardComponent } from '../../components/restaurant-card/restaurant-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonSearchbar,
    IonRefresher, IonRefresherContent, IonFab, IonFabButton,
    IonSpinner, IonChip,
    RestaurantCardComponent
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <span class="font-bold px-2">MenuBoard</span>
        </ion-title>
        <ion-buttons slot="end">
          @if (authService.isLoggedIn()) {
            <ion-button (click)="router.navigate(['/my-restaurants'])">
              <ion-icon name="person-outline"></ion-icon>
            </ion-button>
          } @else {
            <ion-button (click)="router.navigate(['/auth/login'])">
              <ion-icon name="log-in-outline"></ion-icon>
            </ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="onRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Hero Section -->
      <div class="px-4 pt-2 pb-4 bg-gradient-to-b from-indigo-600 to-indigo-500 text-white">
        <h2 class="text-2xl font-bold mb-1">Find Restaurants Near You</h2>
        <p class="text-indigo-100 text-sm mb-4">Browse menus and check prices before you go</p>
        <ion-searchbar
          [(ngModel)]="searchQuery"
          (ionInput)="onSearch()"
          placeholder="Search restaurants, cafes..."
          class="rounded-xl"
          color="light"
        ></ion-searchbar>
      </div>

      <!-- Filter Chips -->
      <div class="flex gap-2 px-4 py-3 overflow-x-auto flex-wrap">
        @for (filter of typeFilters; track filter.value) {
          <ion-chip
          [color]="selectedType === filter.value ? 'primary' : 'medium'"
          (click)="selectType(filter.value)"
          class="shrink-0 grow-1"
          >
          <span class="px-2 w-full text-center">{{ filter.label }}</span>
        </ion-chip>
      }
      <!-- Nearby Toggle -->
      @if (userLocation()) {
        <div class="">
          <ion-chip color="success" (click)="toggleNearby()">
            <span class="px-2 w-full text-center flex items-center justify-center gap-1">
              <ion-icon name="navigate-outline" class="mr-1"></ion-icon>
              {{ showNearby() ? 'Showing Nearby' : 'Show Nearby' }}
            </span>
          </ion-chip>
        </div>
      }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>
      }

      <!-- Restaurant List -->
      @if (!loading()) {
        @if (restaurants().length === 0) {
          <div class="text-center py-16 px-4">
            <p class="text-6xl mb-4">🍽️</p>
            <h3 class="text-lg font-semibold text-gray-300 mb-2">No restaurants found</h3>
            <p class="text-gray-500 text-sm mb-6">Be the first to add one!</p>
            <ion-button (click)="router.navigate(['/add-restaurant'])" fill="solid" color="primary">
              Add Restaurant
            </ion-button>
          </div>
        } @else {
          <div class="px-4 py-2">
            <p class="text-xs text-gray-500 mb-3">{{ restaurants().length }} place(s) found</p>
            <div class="space-y-3 flex flex-col">
              @for (restaurant of restaurants(); track restaurant._id) {
                <app-restaurant-card
                  [restaurant]="restaurant"
                  (click)="router.navigate(['/restaurant', restaurant._id])"
                ></app-restaurant-card>
              }
            </div>
          </div>
          <!-- Public Data Disclaimer -->
          <div class="mx-4 my-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-xl">
            <p class="text-xs text-amber-300">
              ⚠️ <strong>Disclaimer:</strong> Menu prices and information are publicly submitted and may differ from actual prices. Always verify with the restaurant.
            </p>
          </div>
        }
      }

      <!-- FAB -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button color="primary" (click)="router.navigate(['/add-restaurant'])">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
})
export class HomePage implements OnInit {
  restaurants = signal<Restaurant[]>([]);
  loading = signal(true);
  searchQuery = '';
  selectedType = '';
  userLocation = signal<{ lat: number; lng: number } | null>(null);
  showNearby = signal(false);
  private _searchTimer: ReturnType<typeof setTimeout> | undefined;

  typeFilters = [
    { label: 'All', value: '' },
    { label: 'Restaurants', value: 'restaurant' },
    { label: 'Cafes', value: 'cafe' },
    { label: 'Tea Shops', value: 'teashop' },
    { label: 'Other', value: 'other' },
  ];

  constructor(
    public router: Router,
    private apiService: ApiService,
    public authService: AuthService,
    private locationService: LocationService
  ) {
    addIcons({ addOutline, locationOutline, searchOutline, personOutline, restaurantOutline, cafeOutline, logInOutline, refreshOutline, navigateOutline, starOutline });
  }

  async ngOnInit() {
    this.loadRestaurants();
    const loc = await this.locationService.getCurrentPosition();
    if (loc) this.userLocation.set(loc);
  }

  loadRestaurants() {
    this.loading.set(true);
    if (this.showNearby() && this.userLocation()) {
      const loc = this.userLocation()!;
      this.apiService.getNearbyRestaurants(loc.lat, loc.lng).subscribe({
        next: r => { this.restaurants.set(r); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else {
      const params: any = {};
      if (this.searchQuery.trim()) params.search = this.searchQuery.trim();
      if (this.selectedType) params.type = this.selectedType;
      this.apiService.getRestaurants(params).subscribe({
        next: r => { this.restaurants.set(r); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  onSearch() {
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this.loadRestaurants(), 400);
  }

  selectType(type: string) {
    this.selectedType = type;
    this.loadRestaurants();
  }

  toggleNearby() {
    this.showNearby.update(v => !v);
    this.loadRestaurants();
  }

  onRefresh(event: any) {
    this.loadRestaurants();
    setTimeout(() => event.target.complete(), 1000);
  }
}
