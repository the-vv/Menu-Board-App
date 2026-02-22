import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.page').then(m => m.SearchPage)
  },
  {
    path: 'restaurant/:id',
    loadComponent: () => import('./pages/restaurant-detail/restaurant-detail.page').then(m => m.RestaurantDetailPage)
  },
  {
    path: 'add-restaurant',
    loadComponent: () => import('./pages/add-restaurant/add-restaurant.page').then(m => m.AddRestaurantPage)
  },
  {
    path: 'edit-restaurant/:id',
    loadComponent: () => import('./pages/add-restaurant/add-restaurant.page').then(m => m.AddRestaurantPage)
  },
  {
    path: 'add-menu-item/:restaurantId',
    loadComponent: () => import('./pages/add-menu-item/add-menu-item.page').then(m => m.AddMenuItemPage)
  },
  {
    path: 'edit-menu-item/:id',
    loadComponent: () => import('./pages/add-menu-item/add-menu-item.page').then(m => m.AddMenuItemPage)
  },
  {
    path: 'my-restaurants',
    loadComponent: () => import('./pages/my-restaurants/my-restaurants.page').then(m => m.MyRestaurantsPage)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage)
  },
  { path: '**', redirectTo: 'home' }
];
