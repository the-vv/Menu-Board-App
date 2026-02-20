import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonButton, IonIcon, IonSpinner, IonSearchbar, IonChip, IonFab, IonFabButton,
  IonActionSheet, AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, pencilOutline, trashOutline, locationOutline,
  callOutline, globeOutline, chevronDownOutline, checkmarkCircleOutline,
  closeCircleOutline, ellipsisVerticalOutline
} from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Restaurant, MenuItem } from '../../models';

interface GroupedMenuItems {
  category: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
    IonButton, IonIcon, IonSpinner, IonSearchbar, IonChip, IonFab, IonFabButton,
    IonActionSheet
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ restaurant()?.name || 'Restaurant' }}</ion-title>
        @if (isOwner()) {
          <ion-buttons slot="end">
            <ion-button (click)="showActions = true">
              <ion-icon name="ellipsis-vertical-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        }
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (loading()) {
        <div class="flex justify-center py-16">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>
      } @else if (restaurant()) {
        <!-- Restaurant Info Card -->
        <div class="bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-4 py-6">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
              {{ getTypeEmoji() }}
            </div>
            <div>
              <h1 class="text-xl font-bold">{{ restaurant()!.name }}</h1>
              <span class="text-sm text-indigo-200 capitalize">{{ restaurant()!.type }}</span>
            </div>
          </div>
          @if (restaurant()!.description) {
            <p class="text-indigo-100 text-sm mb-3">{{ restaurant()!.description }}</p>
          }
          <div class="flex flex-col gap-1.5">
            @if (restaurant()!.address) {
              <div class="flex items-center gap-2 text-sm text-indigo-100">
                <ion-icon name="location-outline"></ion-icon>
                <span>{{ restaurant()!.address }}</span>
              </div>
            }
            @if (restaurant()!.phone) {
              <div class="flex items-center gap-2 text-sm text-indigo-100">
                <ion-icon name="call-outline"></ion-icon>
                <a [href]="'tel:' + restaurant()!.phone" class="text-white">{{ restaurant()!.phone }}</a>
              </div>
            }
          </div>
          @if (!restaurant()!.isPublic) {
            <div class="mt-3 inline-block bg-purple-400/30 text-white text-xs px-3 py-1 rounded-full">
              🔒 Private
            </div>
          }
        </div>

        <!-- Search Menu -->
        <div class="px-4 pt-4">
          <ion-searchbar
            [(ngModel)]="menuSearch"
            (ionInput)="filterMenuItems()"
            placeholder="Search menu items..."
            class="p-0 rounded-xl"
          ></ion-searchbar>
        </div>

        <!-- Category Filter -->
        @if (categories().length > 1) {
          <div class="flex gap-2 px-4 py-2 overflow-x-auto">
            <ion-chip
              [color]="selectedCategory() === '' ? 'primary' : 'medium'"
              (click)="selectCategory('')"
              class="shrink-0"
            >All</ion-chip>
            @for (cat of categories(); track cat) {
              <ion-chip
                [color]="selectedCategory() === cat ? 'primary' : 'medium'"
                (click)="selectCategory(cat)"
                class="shrink-0"
              >{{ cat }}</ion-chip>
            }
          </div>
        }

        <!-- Menu Items -->
        @if (menuLoading()) {
          <div class="flex justify-center py-8">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
          </div>
        } @else if (filteredGroups().length === 0) {
          <div class="text-center py-12 px-4">
            <p class="text-4xl mb-3">🍽️</p>
            <p class="text-gray-400 mb-4">No menu items yet</p>
            <ion-button (click)="addMenuItem()" fill="outline" color="primary" size="small">
              <ion-icon name="add-outline" slot="start"></ion-icon>
              Add Menu Item
            </ion-button>
          </div>
        } @else {
          <div class="px-4 py-2 pb-24">
            @for (group of filteredGroups(); track group.category) {
              @if (group.category) {
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2">
                  {{ group.category }}
                </h3>
              }
              <div class="space-y-2">
                @for (item of group.items; track item._id) {
                  <div class="bg-gray-800 rounded-xl border border-gray-700 p-3 flex items-center gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <h4 class="font-medium text-white">{{ item.name }}</h4>
                        @if (!item.isAvailable) {
                          <span class="text-xs bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded">N/A</span>
                        }
                      </div>
                      @if (item.description) {
                        <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">{{ item.description }}</p>
                      }
                    </div>
                    <div class="text-right shrink-0">
                      <span class="text-lg font-bold text-indigo-400">
                        {{ item.currency === 'INR' ? '₹' : item.currency }} {{ item.price | number:'1.0-2' }}
                      </span>
                    </div>
                    @if (isOwner()) {
                      <ion-button fill="clear" size="small" (click)="editMenuItem(item)">
                        <ion-icon name="pencil-outline" slot="icon-only"></ion-icon>
                      </ion-button>
                    }
                  </div>
                }
              </div>
            }
          </div>
          <!-- Disclaimer -->
          <div class="mx-4 mb-6 p-3 bg-amber-900/30 border border-amber-700/50 rounded-xl">
            <p class="text-xs text-amber-300">
              ⚠️ <strong>Disclaimer:</strong> Prices shown are user-reported and may differ from actual prices. Please verify with the restaurant.
            </p>
          </div>
        }
      }

      <!-- FAB -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button color="primary" (click)="addMenuItem()">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- Action Sheet for owner -->
    <ion-action-sheet
      [isOpen]="showActions"
      [buttons]="actionButtons"
      (didDismiss)="showActions = false"
    ></ion-action-sheet>
  `
})
export class RestaurantDetailPage implements OnInit {
  restaurant = signal<Restaurant | null>(null);
  menuItems = signal<MenuItem[]>([]);
  filteredGroups = signal<GroupedMenuItems[]>([]);
  categories = signal<string[]>([]);
  selectedCategory = signal('');
  loading = signal(true);
  menuLoading = signal(true);
  showActions = false;
  menuSearch = '';

  actionButtons = [
    {
      text: 'Edit Restaurant',
      icon: 'pencil-outline',
      handler: () => {
        const id = this.restaurant()?._id;
        if (id) this.router.navigate(['/edit-restaurant', id]);
      }
    },
    {
      text: 'Delete Restaurant',
      icon: 'trash-outline',
      role: 'destructive',
      handler: () => this.confirmDelete()
    },
    { text: 'Cancel', role: 'cancel' }
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private apiService: ApiService,
    public authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ addOutline, pencilOutline, trashOutline, locationOutline, callOutline, globeOutline, chevronDownOutline, checkmarkCircleOutline, closeCircleOutline, ellipsisVerticalOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadRestaurant(id);
    this.loadMenuItems(id);
  }

  loadRestaurant(id: string) {
    this.apiService.getRestaurant(id).subscribe({
      next: r => { this.restaurant.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadMenuItems(id: string) {
    this.menuLoading.set(true);
    this.apiService.getMenuItems(id).subscribe({
      next: items => {
        this.menuItems.set(items);
        this.menuLoading.set(false);
        const cats = [...new Set(items.map(i => i.category).filter(Boolean))] as string[];
        this.categories.set(cats);
        this.groupMenuItems();
      },
      error: () => this.menuLoading.set(false)
    });
  }

  groupMenuItems() {
    const items = this.menuItems().filter(item => {
      const matchesSearch = !this.menuSearch || item.name.toLowerCase().includes(this.menuSearch.toLowerCase()) || item.description?.toLowerCase().includes(this.menuSearch.toLowerCase());
      const matchesCategory = !this.selectedCategory() || item.category === this.selectedCategory();
      return matchesSearch && matchesCategory;
    });

    const grouped: Record<string, MenuItem[]> = {};
    items.forEach(item => {
      const key = item.category || 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    this.filteredGroups.set(
      Object.entries(grouped).map(([cat, its]) => ({
        category: cat === 'Other' && !this.categories().length ? '' : cat,
        items: its
      }))
    );
  }

  filterMenuItems() {
    this.groupMenuItems();
  }

  selectCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.groupMenuItems();
  }

  isOwner(): boolean {
    const user = this.authService.currentUser();
    const r = this.restaurant();
    return !!(user && r && r.createdBy === user.id);
  }

  addMenuItem() {
    this.router.navigate(['/add-menu-item', this.restaurant()?._id]);
  }

  editMenuItem(item: MenuItem) {
    this.router.navigate(['/edit-menu-item', item._id], {
      queryParams: { restaurantId: item.restaurantId }
    });
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Delete Restaurant',
      message: 'Delete this restaurant and all its menu items? This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.apiService.deleteRestaurant(this.restaurant()!._id).subscribe({
              next: () => this.router.navigate(['/home']),
              error: async () => {
                const toast = await this.toastController.create({
                  message: 'Failed to delete restaurant',
                  duration: 3000,
                  color: 'danger',
                  position: 'bottom'
                });
                await toast.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  getTypeEmoji(): string {
    const map: Record<string, string> = {
      restaurant: '🍽️', cafe: '☕', teashop: '🍵', other: '🏪'
    };
    return map[this.restaurant()?.type || ''] || '🍽️';
  }
}
