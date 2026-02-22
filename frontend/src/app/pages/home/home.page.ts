import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonSearchbar,
  IonRefresher, IonRefresherContent, IonFab, IonFabButton,
  IonSpinner, IonChip, IonInfiniteScroll, IonInfiniteScrollContent,
  ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, locationOutline, personOutline,
  logInOutline, navigateOutline, warningOutline, storefrontOutline
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
    IonSpinner, IonChip, IonInfiniteScroll, IonInfiniteScrollContent,
    RestaurantCardComponent
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <span class="font-bold">MenuBoard</span>
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
      <div class="px-4 pt-2 pb-4 bg-gradient-to-b from-teal-700 to-teal-600 text-white">
        <h2 class="text-2xl font-bold mb-1">Discover Restaurants</h2>
        <p class="text-teal-100 text-sm mb-4">Browse menus and check prices before you go</p>
        <ion-searchbar
          [(ngModel)]="searchQuery"
          (ionInput)="onSearch()"
          placeholder="Search restaurants, cafes..."
          class="rounded-xl"
          color="light"
        ></ion-searchbar>
      </div>

      <!-- Filter Chips -->
      <div class="flex gap-2 px-4 py-3 overflow-x-auto">
        @for (filter of typeFilters; track filter.value) {
          <ion-chip
            [color]="selectedType === filter.value ? 'primary' : 'medium'"
            (click)="selectType(filter.value)"
            class="shrink-0"
          >
            <span class="px-1">{{ filter.label }}</span>
          </ion-chip>
        }
        @if (userLocation()) {
          <ion-chip [color]="showNearby() ? 'primary' : 'medium'" (click)="toggleNearby()" class="shrink-0">
            <ion-icon name="navigate-outline" class="mr-1"></ion-icon>
            <span class="px-1">{{ showNearby() ? 'Nearby' : 'Show Nearby' }}</span>
          </ion-chip>
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
            <ion-icon name="storefront-outline" class="text-6xl text-gray-600 mb-4 block"></ion-icon>
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
          <!-- Disclaimer -->
          <div class="mx-4 my-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-xl flex gap-2">
            <ion-icon name="warning-outline" class="text-amber-400 shrink-0 mt-0.5"></ion-icon>
            <p class="text-xs text-amber-300">
              <strong>Disclaimer:</strong> Menu prices and information are publicly submitted and may differ from actual prices. Always verify with the restaurant.
            </p>
          </div>
        }
      }

      <!-- Infinite Scroll -->
      <ion-infinite-scroll [disabled]="!hasMore() || showNearby()" (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content loadingText="Loading more..."></ion-infinite-scroll-content>
      </ion-infinite-scroll>

      <!-- FAB -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button color="primary" (click)="router.navigate(['/add-restaurant'])">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
})
export class HomePage implements OnInit, ViewWillEnter {
  restaurants = signal<Restaurant[]>([]);
  loading = signal(true);
  hasMore = signal(true);
  searchQuery = '';
  selectedType = '';
  userLocation = signal<{ lat: number; lng: number } | null>(null);
  showNearby = signal(false);
  private currentPage = 1;
  private readonly pageLimit = 20;
  private _searchTimer: ReturnType<typeof setTimeout> | undefined;

  typeFilters = [
    { label: 'All', value: '' },
    { label: 'Restaurant', value: 'restaurant' },
    { label: 'Cafe', value: 'cafe' },
    { label: 'Tea Shop', value: 'teashop' },
    { label: 'Other', value: 'other' },
  ];

  constructor(
    public router: Router,
    private apiService: ApiService,
    public authService: AuthService,
    private locationService: LocationService
  ) {
    addIcons({ addOutline, locationOutline, personOutline, logInOutline, navigateOutline, warningOutline, storefrontOutline });
  }

  async ngOnInit() {
    const loc = await this.locationService.getCurrentPosition();
    if (loc) {
      this.userLocation.set(loc);
      this.showNearby.set(true);
    }
    this.resetAndLoad();
  }

  ionViewWillEnter() {
    this.resetAndLoad();
  }

  resetAndLoad() {
    this.currentPage = 1;
    this.hasMore.set(true);
    this.restaurants.set([]);
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.loading.set(true);
    if (this.showNearby() && this.userLocation()) {
      const loc = this.userLocation()!;
      this.apiService.getNearbyRestaurants(loc.lat, loc.lng).subscribe({
        next: r => { this.restaurants.set(r); this.loading.set(false); this.hasMore.set(false); },
        error: () => this.loading.set(false)
      });
    } else {
      const params: any = { page: this.currentPage, limit: this.pageLimit };
      if (this.searchQuery.trim()) params.search = this.searchQuery.trim();
      if (this.selectedType) params.type = this.selectedType;
      this.apiService.getRestaurants(params).subscribe({
        next: r => {
          if (this.currentPage === 1) {
            this.restaurants.set(r);
          } else {
            this.restaurants.update(prev => [...prev, ...r]);
          }
          this.hasMore.set(r.length === this.pageLimit);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  loadMore(event: any) {
    this.currentPage++;
    const params: any = { page: this.currentPage, limit: this.pageLimit };
    if (this.searchQuery.trim()) params.search = this.searchQuery.trim();
    if (this.selectedType) params.type = this.selectedType;
    this.apiService.getRestaurants(params).subscribe({
      next: r => {
        this.restaurants.update(prev => [...prev, ...r]);
        this.hasMore.set(r.length === this.pageLimit);
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  onSearch() {
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => { this.showNearby.set(false); this.resetAndLoad(); }, 400);
  }

  selectType(type: string) {
    this.selectedType = type;
    this.resetAndLoad();
  }

  toggleNearby() {
    this.showNearby.update(v => !v);
    this.resetAndLoad();
  }

  onRefresh(event: any) {
    this.resetAndLoad();
    setTimeout(() => event.target.complete(), 1000);
  }
}
