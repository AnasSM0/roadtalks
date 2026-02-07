/**
 * Location Service
 * Manages GPS tracking for driver position
 */

import { Platform, PermissionsAndroid } from 'react-native';
import { APP_CONFIG } from '../firebase/config';
import type { GeoPoint } from '@/types';

// Note: In real implementation, import from @react-native-community/geolocation
// import Geolocation from '@react-native-community/geolocation';

interface LocationUpdate {
  location: GeoPoint;
  heading: number;
  speed: number;
  accuracy: number;
  timestamp: Date;
}

type LocationCallback = (update: LocationUpdate) => void;
type ErrorCallback = (error: Error) => void;

class LocationService {
  private watchId: number | null = null;
  private lastLocation: LocationUpdate | null = null;
  private callbacks: Set<LocationCallback> = new Set();
  private errorCallback: ErrorCallback | null = null;

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'RoadTalk needs access to your location to find nearby drivers.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('[Location] Permission error:', err);
        return false;
      }
    }
    // iOS permissions are handled via Info.plist
    return true;
  }

  /**
   * Start tracking location
   */
  async startTracking(onError?: ErrorCallback): Promise<boolean> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.error('[Location] Permission denied');
      return false;
    }

    this.errorCallback = onError || null;

    // In real implementation:
    // this.watchId = Geolocation.watchPosition(
    //   (position) => this.handlePositionUpdate(position),
    //   (error) => this.handleError(error),
    //   {
    //     enableHighAccuracy: true,
    //     distanceFilter: 10, // meters
    //     interval: APP_CONFIG.locationUpdateIntervalMs,
    //     fastestInterval: APP_CONFIG.locationUpdateIntervalMs / 2,
    //   }
    // );

    console.log('[Location] Started tracking');

    // Mock: Simulate location updates
    this.simulateLocationUpdates();

    return true;
  }

  /**
   * Stop tracking location
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      // In real implementation:
      // Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    console.log('[Location] Stopped tracking');
  }

  /**
   * Subscribe to location updates
   */
  subscribe(callback: LocationCallback): () => void {
    this.callbacks.add(callback);

    // Send last known location immediately
    if (this.lastLocation) {
      callback(this.lastLocation);
    }

    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Get current location (one-time)
   */
  async getCurrentLocation(): Promise<LocationUpdate | null> {
    // In real implementation:
    // return new Promise((resolve, reject) => {
    //   Geolocation.getCurrentPosition(
    //     (position) => {
    //       const update = this.parsePosition(position);
    //       resolve(update);
    //     },
    //     (error) => reject(error),
    //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    //   );
    // });

    // Mock: Return simulated location
    return this.lastLocation || {
      location: { latitude: 33.5731, longitude: -7.5898 },
      heading: 45,
      speed: 60,
      accuracy: 10,
      timestamp: new Date(),
    };
  }

  /**
   * Parse native position to our format
   */
  private parsePosition(position: GeolocationPosition): LocationUpdate {
    return {
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      heading: position.coords.heading || 0,
      speed: (position.coords.speed || 0) * 3.6, // m/s to km/h
      accuracy: position.coords.accuracy,
      timestamp: new Date(position.timestamp),
    };
  }

  /**
   * Handle position update from native
   */
  private handlePositionUpdate(position: GeolocationPosition): void {
    const update = this.parsePosition(position);
    this.lastLocation = update;

    // Notify all subscribers
    this.callbacks.forEach((callback) => callback(update));
  }

  /**
   * Handle error from native
   */
  private handleError(error: GeolocationPositionError): void {
    console.error('[Location] Error:', error.message);
    this.errorCallback?.(new Error(error.message));
  }

  /**
   * Mock: Simulate location updates for development
   */
  private simulateLocationUpdates(): void {
    let lat = 33.5731;
    let lng = -7.5898;
    let heading = 45;

    const interval = setInterval(() => {
      // Simulate movement
      lat += 0.0001 * Math.cos(heading * (Math.PI / 180));
      lng += 0.0001 * Math.sin(heading * (Math.PI / 180));
      heading = (heading + Math.random() * 10 - 5 + 360) % 360;

      const update: LocationUpdate = {
        location: { latitude: lat, longitude: lng },
        heading,
        speed: 60 + Math.random() * 20,
        accuracy: 5 + Math.random() * 10,
        timestamp: new Date(),
      };

      this.lastLocation = update;
      this.callbacks.forEach((callback) => callback(update));
    }, APP_CONFIG.locationUpdateIntervalMs);

    // Store interval as watchId for cleanup
    this.watchId = interval as unknown as number;
  }
}

// Export singleton instance
export const locationService = new LocationService();

export default locationService;
