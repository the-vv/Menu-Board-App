import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant, MenuItem, AuthResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Auth
  register(data: { email: string; password: string; name: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, data);
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, data);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.base}/auth/profile`);
  }

  // Restaurants
  getRestaurants(params?: { search?: string; type?: string; page?: number; limit?: number }): Observable<Restaurant[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit) httpParams = httpParams.set('limit', String(params.limit));
    return this.http.get<Restaurant[]>(`${this.base}/restaurants`, { params: httpParams });
  }

  getNearbyRestaurants(
    lat: number,
    lng: number,
    options?: { distance?: number; search?: string; type?: string },
  ): Observable<Restaurant[]> {
    let params = new HttpParams()
      .set('lat', lat)
      .set('lng', lng)
      .set('distance', options?.distance ?? 5000);

    if (options?.search?.trim()) params = params.set('search', options.search.trim());
    if (options?.type) params = params.set('type', options.type);

    return this.http.get<Restaurant[]>(`${this.base}/restaurants/nearby`, { params });
  }

  getMyRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.base}/restaurants/my`);
  }

  getRestaurant(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.base}/restaurants/${id}`);
  }

  createRestaurant(data: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.base}/restaurants`, data);
  }

  updateRestaurant(id: string, data: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.base}/restaurants/${id}`, data);
  }

  deleteRestaurant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/restaurants/${id}`);
  }

  // Menu Items
  getMenuItems(restaurantId: string, params?: { category?: string }): Observable<MenuItem[]> {
    let httpParams = new HttpParams();
    if (params?.category) httpParams = httpParams.set('category', params.category);
    return this.http.get<MenuItem[]>(`${this.base}/menu-items/restaurant/${restaurantId}`, { params: httpParams });
  }

  getCategories(restaurantId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/menu-items/restaurant/${restaurantId}/categories`);
  }

  createMenuItem(data: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.base}/menu-items`, data);
  }

  updateMenuItem(id: string, data: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${this.base}/menu-items/${id}`, data);
  }

  deleteMenuItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/menu-items/${id}`);
  }
}
