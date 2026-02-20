import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonButton, IonIcon, IonInput, IonTextarea, IonSelect,
  IonSelectOption, IonToggle, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, saveOutline, navigateOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
    IonButton, IonIcon, IonInput, IonTextarea, IonSelect,
    IonSelectOption, IonToggle, IonSpinner
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button [defaultHref]="isEdit ? '/restaurant/' + restaurantId : '/home'"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Edit' : 'Add' }} Restaurant</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-4 py-4">
        <!-- Name -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Name *</label>
          <ion-input
            formControlName="name"
            placeholder="Restaurant or cafe name"
            fill="outline"
            class="rounded-xl"
          ></ion-input>
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p class="text-red-400 text-xs mt-1">Name is required</p>
          }
        </div>

        <!-- Type -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Type *</label>
          <ion-select formControlName="type" fill="outline" placeholder="Select type">
            <ion-select-option value="restaurant">🍽️ Restaurant</ion-select-option>
            <ion-select-option value="cafe">☕ Cafe</ion-select-option>
            <ion-select-option value="teashop">🍵 Tea Shop</ion-select-option>
            <ion-select-option value="other">🏪 Other</ion-select-option>
          </ion-select>
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <ion-textarea
            formControlName="description"
            placeholder="Brief description..."
            fill="outline"
            [rows]="3"
            class="rounded-xl"
          ></ion-textarea>
        </div>

        <!-- Address -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Address</label>
          <ion-input
            formControlName="address"
            placeholder="Full address"
            fill="outline"
            class="rounded-xl"
          ></ion-input>
        </div>

        <!-- Location -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Location (GPS)</label>
          <div class="flex gap-2 mb-2">
            <ion-input
              formControlName="lat"
              placeholder="Latitude"
              type="number"
              fill="outline"
              class="rounded-xl flex-1"
            ></ion-input>
            <ion-input
              formControlName="lng"
              placeholder="Longitude"
              type="number"
              fill="outline"
              class="rounded-xl flex-1"
            ></ion-input>
          </div>
          <ion-button fill="outline" size="small" (click)="useCurrentLocation()" [disabled]="gettingLocation()">
            @if (gettingLocation()) {
              <ion-spinner name="crescent" slot="start" class="w-4 h-4"></ion-spinner>
            } @else {
              <ion-icon name="navigate-outline" slot="start"></ion-icon>
            }
            Use My Location
          </ion-button>
        </div>

        <!-- Phone -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Phone</label>
          <ion-input
            formControlName="phone"
            placeholder="Phone number"
            type="tel"
            fill="outline"
            class="rounded-xl"
          ></ion-input>
        </div>

        <!-- Website -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Website</label>
          <ion-input
            formControlName="website"
            placeholder="https://..."
            type="url"
            fill="outline"
            class="rounded-xl"
          ></ion-input>
        </div>

        <!-- Tags -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Tags</label>
          <ion-input
            formControlName="tags"
            placeholder="wifi, parking, outdoor (comma separated)"
            fill="outline"
            class="rounded-xl"
          ></ion-input>
        </div>

        <!-- Public Toggle -->
        <div class="mb-6 flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
          <div>
            <p class="font-medium text-white">Make Public</p>
            <p class="text-xs text-gray-400 mt-0.5">Visible to all users</p>
          </div>
          <ion-toggle formControlName="isPublic" color="primary"></ion-toggle>
        </div>

        <!-- Submit -->
        <ion-button
          type="submit"
          expand="block"
          color="primary"
          [disabled]="form.invalid || saving()"
          class="rounded-xl"
        >
          @if (saving()) {
            <ion-spinner name="crescent" slot="start"></ion-spinner>
          } @else {
            <ion-icon name="save-outline" slot="start"></ion-icon>
          }
          {{ isEdit ? 'Update' : 'Add' }} Restaurant
        </ion-button>

        @if (error()) {
          <div class="mt-3 p-3 bg-red-900/40 border border-red-700/50 rounded-xl">
            <p class="text-red-400 text-sm">{{ error() }}</p>
          </div>
        }
      </form>
    </ion-content>
  `
})
export class AddRestaurantPage implements OnInit {
  form: FormGroup;
  saving = signal(false);
  gettingLocation = signal(false);
  error = signal('');
  isEdit = false;
  restaurantId = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private apiService: ApiService,
    private locationService: LocationService
  ) {
    addIcons({ locationOutline, saveOutline, navigateOutline });
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['restaurant', Validators.required],
      description: [''],
      address: [''],
      lat: [null],
      lng: [null],
      phone: [''],
      website: [''],
      tags: [''],
      isPublic: [true]
    });
  }

  ngOnInit() {
    this.restaurantId = this.route.snapshot.paramMap.get('id') || '';
    if (this.restaurantId) {
      this.isEdit = true;
      this.loadRestaurant();
    }
  }

  loadRestaurant() {
    this.apiService.getRestaurant(this.restaurantId).subscribe({
      next: r => {
        this.form.patchValue({
          name: r.name,
          type: r.type,
          description: r.description || '',
          address: r.address || '',
          lat: r.location?.coordinates?.[1] || null,
          lng: r.location?.coordinates?.[0] || null,
          phone: r.phone || '',
          website: r.website || '',
          tags: r.tags?.join(', ') || '',
          isPublic: r.isPublic
        });
      }
    });
  }

  async useCurrentLocation() {
    this.gettingLocation.set(true);
    const loc = await this.locationService.getCurrentPosition();
    if (loc) {
      this.form.patchValue({ lat: loc.lat, lng: loc.lng });
    }
    this.gettingLocation.set(false);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');

    const val = this.form.value;
    const data: any = {
      name: val.name,
      type: val.type,
      description: val.description,
      address: val.address,
      phone: val.phone,
      website: val.website,
      isPublic: val.isPublic,
      tags: val.tags ? val.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    };

    if (val.lat && val.lng) {
      data.location = { lat: parseFloat(val.lat), lng: parseFloat(val.lng) };
    }

    const obs = this.isEdit
      ? this.apiService.updateRestaurant(this.restaurantId, data)
      : this.apiService.createRestaurant(data);

    obs.subscribe({
      next: r => {
        this.saving.set(false);
        this.router.navigate(['/restaurant', r._id]);
      },
      error: err => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Failed to save restaurant');
      }
    });
  }
}
