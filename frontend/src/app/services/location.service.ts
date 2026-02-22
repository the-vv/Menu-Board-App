import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Coords {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  async getCurrentPosition(): Promise<Coords | null> {
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location !== 'granted') return null;
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return null;
    }
  }
}
