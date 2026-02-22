import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonButton, IonIcon, IonInput, IonTextarea, IonSelect,
  IonSelectOption, IonToggle, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline, saveOutline, navigateOutline, chevronDownOutline,
  chevronUpOutline, informationCircleOutline
} from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
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
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-4 py-4 space-y-4">

        <!-- Name (required) -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Name <span class="text-red-400">*</span></label>
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

        <!-- Type (required) -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Type <span class="text-red-400">*</span></label>
          <ion-select
            formControlName="type"
            fill="outline"
            placeholder="Select type"
            interface="action-sheet"
          >
            <ion-select-option value="restaurant">Restaurant</ion-select-option>
            <ion-select-option value="cafe">Cafe</ion-select-option>
            <ion-select-option value="teashop">Tea Shop</ion-select-option>
            <ion-select-option value="other">Other</ion-select-option>
          </ion-select>
        </div>

        <!-- Location (required) -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Location <span class="text-red-400">*</span>
          </label>
          <ion-button
            expand="block"
            fill="outline"
            color="primary"
            (click)="useCurrentLocation()"
            [disabled]="gettingLocation()"
            class="mb-2"
          >
            @if (gettingLocation()) {
              <ion-spinner name="crescent" slot="start" class="w-4 h-4"></ion-spinner>
              Getting location...
            } @else {
              <ion-icon name="navigate-outline" slot="start"></ion-icon>
              {{ locationAcquired() ? 'Location Acquired' : 'Use My Location' }}
            }
          </ion-button>
          @if (locationAcquired()) {
            <div class="flex gap-2">
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
          }
          @if (!locationAcquired() && form.get('lat')?.touched && !form.get('lat')?.value) {
            <p class="text-red-400 text-xs mt-1">Location is required. Use the button above or enter coordinates manually.</p>
          }
          @if (!locationAcquired()) {
            <button type="button" class="text-xs text-teal-400 mt-1 underline" (click)="showManualCoords = !showManualCoords">
              Enter coordinates manually
            </button>
            @if (showManualCoords) {
              <div class="flex gap-2 mt-2">
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
            }
          }
        </div>

        <!-- Optional / Extra Details -->
        <div class="rounded-xl border border-gray-700 overflow-hidden">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 bg-gray-800 text-white"
            (click)="showExtra = !showExtra"
          >
            <span class="text-sm font-medium">Additional Details</span>
            <ion-icon [name]="showExtra ? 'chevron-up-outline' : 'chevron-down-outline'" class="text-gray-400"></ion-icon>
          </button>

          @if (showExtra) {
            <div class="px-4 pb-4 pt-3 space-y-4 bg-gray-900/40">
              <!-- Description -->
              <div>
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
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Address</label>
                <ion-input
                  formControlName="address"
                  placeholder="Full street address"
                  fill="outline"
                  class="rounded-xl"
                ></ion-input>
              </div>

              <!-- Phone -->
              <div>
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
              <div>
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
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                <ion-input
                  formControlName="tags"
                  placeholder="wifi, parking, outdoor (comma separated)"
                  fill="outline"
                  class="rounded-xl"
                ></ion-input>
              </div>

              <!-- Public Toggle -->
              <div class="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                <div>
                  <p class="font-medium text-white">Make Public</p>
                  <p class="text-xs text-gray-400 mt-0.5">Visible to all users</p>
                </div>
                <ion-toggle formControlName="isPublic" color="primary"></ion-toggle>
              </div>
            </div>
          }
        </div>

        <!-- Submit -->
        <ion-button
          type="submit"
          expand="block"
          color="primary"
          [disabled]="form.invalid || saving()"
        >
          @if (saving()) {
            <ion-spinner name="crescent" slot="start"></ion-spinner>
          } @else {
            <ion-icon name="save-outline" slot="start"></ion-icon>
          }
          {{ isEdit ? 'Update' : 'Add' }} Restaurant
        </ion-button>

        @if (error()) {
          <div class="p-3 bg-red-900/40 border border-red-700/50 rounded-xl">
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
  locationAcquired = signal(false);
  error = signal('');
  isEdit = false;
  restaurantId = '';
  showExtra = false;
  showManualCoords = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private locationService: LocationService,
    private toastController: ToastController
  ) {
    addIcons({ locationOutline, saveOutline, navigateOutline, chevronDownOutline, chevronUpOutline, informationCircleOutline });
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['restaurant', Validators.required],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
      description: [''],
      address: [''],
      phone: [''],
      website: [''],
      tags: [''],
      isPublic: [true]
    });
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.restaurantId = this.route.snapshot.paramMap.get('id') || '';
    if (this.restaurantId) {
      this.isEdit = true;
      this.loadRestaurant();
    }
  }

  loadRestaurant() {
    this.apiService.getRestaurant(this.restaurantId).subscribe({
      next: r => {
        const lat = r.location?.coordinates?.[1] || null;
        const lng = r.location?.coordinates?.[0] || null;
        this.form.patchValue({
          name: r.name,
          type: r.type,
          description: r.description || '',
          address: r.address || '',
          lat,
          lng,
          phone: r.phone || '',
          website: r.website || '',
          tags: r.tags?.join(', ') || '',
          isPublic: r.isPublic
        });
        if (lat && lng) {
          this.locationAcquired.set(true);
          this.showExtra = !!(r.description || r.address || r.phone || r.website || r.tags?.length);
        }
      }
    });
  }

  async useCurrentLocation() {
    this.gettingLocation.set(true);
    const loc = await this.locationService.getCurrentPosition();
    if (loc) {
      this.form.patchValue({ lat: loc.lat, lng: loc.lng });
      this.locationAcquired.set(true);
    } else {
      const toast = await this.toastController.create({
        message: 'Could not get location. Please allow location access or enter manually.',
        duration: 3000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      this.showManualCoords = true;
    }
    this.gettingLocation.set(false);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');

    const val = this.form.value;
    const data: any = {
      name: val.name.trim(),
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
