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
import { saveOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-add-menu-item',
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
          <ion-back-button [defaultHref]="'/restaurant/' + restaurantId"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Edit' : 'Add' }} Menu Item</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-4 py-4">
        <!-- Name -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Item Name *</label>
          <ion-input
            formControlName="name"
            placeholder="e.g. Masala Chai, Pasta"
            fill="outline"
            class="rounded-xl"
          ></ion-input>
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p class="text-red-400 text-xs mt-1">Name is required</p>
          }
        </div>

        <!-- Price -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Price *</label>
          <div class="flex gap-2">
            <ion-select formControlName="currency" fill="outline" style="max-width: 100px">
              <ion-select-option value="INR">₹ INR</ion-select-option>
              <ion-select-option value="USD">$ USD</ion-select-option>
              <ion-select-option value="EUR">€ EUR</ion-select-option>
              <ion-select-option value="GBP">£ GBP</ion-select-option>
            </ion-select>
            <ion-input
              formControlName="price"
              placeholder="0.00"
              type="number"
              fill="outline"
              class="rounded-xl flex-1"
              min="0"
              step="0.01"
            ></ion-input>
          </div>
          @if (form.get('price')?.invalid && form.get('price')?.touched) {
            <p class="text-red-400 text-xs mt-1">Valid price is required</p>
          }
        </div>

        <!-- Category -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <ion-input
            formControlName="category"
            placeholder="e.g. Beverages, Starters, Main Course"
            fill="outline"
            class="rounded-xl"
          ></ion-input>
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <ion-textarea
            formControlName="description"
            placeholder="Brief description of the item..."
            fill="outline"
            [rows]="3"
            class="rounded-xl"
          ></ion-textarea>
        </div>

        <!-- Available Toggle -->
        <div class="mb-6 flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
          <div>
            <p class="font-medium text-white">Available</p>
            <p class="text-xs text-gray-400 mt-0.5">Is this item currently available?</p>
          </div>
          <ion-toggle formControlName="isAvailable" color="primary"></ion-toggle>
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
          {{ isEdit ? 'Update' : 'Add' }} Item
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
export class AddMenuItemPage implements OnInit {
  form: FormGroup;
  saving = signal(false);
  error = signal('');
  isEdit = false;
  restaurantId = '';
  itemId = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private apiService: ApiService
  ) {
    addIcons({ saveOutline });
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      currency: ['INR'],
      category: [''],
      description: [''],
      isAvailable: [true]
    });
  }

  ngOnInit() {
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantId') || '';
    this.itemId = this.route.snapshot.paramMap.get('id') || '';
    // Also check query params for restaurantId when in edit mode
    const queryRestaurantId = this.route.snapshot.queryParamMap.get('restaurantId');
    if (queryRestaurantId) this.restaurantId = queryRestaurantId;
    if (this.itemId && this.restaurantId) {
      this.isEdit = true;
      this.loadMenuItem();
    } else if (this.itemId) {
      this.isEdit = true;
    }
  }

  loadMenuItem() {
    this.apiService.getMenuItems(this.restaurantId).subscribe({
      next: items => {
        const item = items.find(i => i._id === this.itemId);
        if (item) {
          this.restaurantId = item.restaurantId;
          this.form.patchValue({
            name: item.name,
            price: item.price,
            currency: item.currency,
            category: item.category || '',
            description: item.description || '',
            isAvailable: item.isAvailable
          });
        }
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');

    const val = this.form.value;
    const data: any = {
      restaurantId: this.restaurantId,
      name: val.name,
      price: parseFloat(val.price),
      currency: val.currency,
      category: val.category,
      description: val.description,
      isAvailable: val.isAvailable
    };

    const obs = this.isEdit
      ? this.apiService.updateMenuItem(this.itemId, data)
      : this.apiService.createMenuItem(data);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/restaurant', this.restaurantId]);
      },
      error: err => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Failed to save menu item');
      }
    });
  }
}
