import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonButton, IonIcon, IonSpinner, IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, logOutOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Restaurant } from '../../models';
import { RestaurantCardComponent } from '../../components/restaurant-card/restaurant-card.component';

@Component({
  selector: 'app-my-restaurants',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
    IonButton, IonIcon, IonSpinner, IonFab, IonFabButton,
    RestaurantCardComponent
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>My Restaurants</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="authService.logout()">
            <ion-icon name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- User Info -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-6">
        <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
          {{ userInitial() }}
        </div>
        <h2 class="text-xl font-bold">{{ authService.currentUser()?.name }}</h2>
        <p class="text-indigo-200 text-sm">{{ authService.currentUser()?.email }}</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>
      } @else if (restaurants().length === 0) {
        <div class="text-center py-16 px-4">
          <p class="text-5xl mb-4">🏪</p>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">No restaurants yet</h3>
          <p class="text-gray-500 text-sm mb-6">Add your first restaurant or cafe</p>
          <ion-button (click)="router.navigate(['/add-restaurant'])" fill="solid" color="primary">
            Add Restaurant
          </ion-button>
        </div>
      } @else {
        <div class="px-4 py-4">
          <p class="text-sm text-gray-500 mb-3">{{ restaurants().length }} restaurant(s)</p>
          <div class="space-y-3">
            @for (r of restaurants(); track r._id) {
              <app-restaurant-card
                [restaurant]="r"
                (click)="router.navigate(['/restaurant', r._id])"
              ></app-restaurant-card>
            }
          </div>
        </div>
      }

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button color="primary" (click)="router.navigate(['/add-restaurant'])">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
})
export class MyRestaurantsPage implements OnInit {
  restaurants = signal<Restaurant[]>([]);
  loading = signal(true);

  constructor(
    public router: Router,
    private apiService: ApiService,
    public authService: AuthService
  ) {
    addIcons({ addOutline, logOutOutline });
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.apiService.getMyRestaurants().subscribe({
      next: r => { this.restaurants.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  userInitial(): string {
    return this.authService.currentUser()?.name?.charAt(0).toUpperCase() || '?';
  }
}
