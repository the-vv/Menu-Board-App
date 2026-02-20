import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonSearchbar, IonSpinner, IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { Restaurant } from '../../models';
import { RestaurantCardComponent } from '../../components/restaurant-card/restaurant-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
    IonSearchbar, IonSpinner, IonChip,
    RestaurantCardComponent
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Search</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="px-4 pt-4">
        <ion-searchbar
          [(ngModel)]="searchQuery"
          (ionInput)="onSearch()"
          placeholder="Search restaurants, cafes..."
          autofocus
        ></ion-searchbar>
      </div>

      @if (loading) {
        <div class="flex justify-center py-8">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>
      } @else if (results.length > 0) {
        <div class="px-4 py-2 space-y-3">
          @for (r of results; track r._id) {
            <app-restaurant-card
              [restaurant]="r"
              (click)="router.navigate(['/restaurant', r._id])"
            ></app-restaurant-card>
          }
        </div>
      } @else if (searchQuery.length > 0) {
        <div class="text-center py-12">
          <p class="text-gray-500">No results for "{{ searchQuery }}"</p>
        </div>
      }
    </ion-content>
  `
})
export class SearchPage {
  searchQuery = '';
  results: Restaurant[] = [];
  loading = false;
  private _timer: ReturnType<typeof setTimeout> | undefined;

  constructor(public router: Router, private apiService: ApiService) {
    addIcons({ searchOutline });
  }

  onSearch() {
    clearTimeout(this._timer);
    if (!this.searchQuery.trim()) { this.results = []; return; }
    this._timer = setTimeout(() => {
      this.loading = true;
      this.apiService.getRestaurants({ search: this.searchQuery }).subscribe({
        next: r => { this.results = r; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }, 400);
  }
}
