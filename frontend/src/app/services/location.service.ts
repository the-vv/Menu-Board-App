import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface Coords {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  async getCurrentPosition(): Promise<Coords | null> {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      return this.getCurrentPositionWeb();
    } else {
      return this.getCurrentPositionNative();
    }
  }

  private async getCurrentPositionWeb(): Promise<Coords | null> {
    if (!navigator.geolocation) return null;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.error('Could not get location', err);
          resolve(null);
        },
        { enableHighAccuracy: true }
      );
    });
  }

  private async getCurrentPositionNative(): Promise<Coords | null> {
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location !== 'granted') return null;
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) {
      console.error('Could not get location', e);
      return null;
    }
  }
}
