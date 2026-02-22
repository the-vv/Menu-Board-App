import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard = () => inject(AuthService).isLoggedIn() ? true : inject(Router).parseUrl('/auth/login');

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
    loadComponent: () => import('./pages/add-restaurant/add-restaurant.page').then(m => m.AddRestaurantPage),
    canActivate: [authGuard]
  },
  {
    path: 'edit-restaurant/:id',
    loadComponent: () => import('./pages/add-restaurant/add-restaurant.page').then(m => m.AddRestaurantPage),
    canActivate: [authGuard]
  },
  {
    path: 'add-menu-item/:restaurantId',
    loadComponent: () => import('./pages/add-menu-item/add-menu-item.page').then(m => m.AddMenuItemPage),
    canActivate: [authGuard]
  },
  {
    path: 'edit-menu-item/:id',
    loadComponent: () => import('./pages/add-menu-item/add-menu-item.page').then(m => m.AddMenuItemPage),
    canActivate: [authGuard]
  },
  {
    path: 'my-restaurants',
    loadComponent: () => import('./pages/my-restaurants/my-restaurants.page').then(m => m.MyRestaurantsPage),
    canActivate: [authGuard]
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
