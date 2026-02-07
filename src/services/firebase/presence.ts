/**
 * Firebase Presence Service
 * Manages online/offline status and location updates
 */

import { COLLECTIONS, APP_CONFIG } from './config';
import { encodeGeohash } from '@/utils/geohash';
import type { GeoPoint, VehicleType, Driver } from '@/types';

interface PresenceData {
  plateNumber: string;
  vehicleType: VehicleType;
  location: GeoPoint;
  heading: number;
  speed: number;
  sessionId: string;
}

/**
 * Initialize presence for a driver
 * Sets up online status and disconnect cleanup
 */
export async function initializePresence(data: PresenceData): Promise<void> {
  // TODO: Implement with Firebase
  // This is a mock implementation

  console.log('[Presence] Initializing for:', data.plateNumber);

  // In real implementation:
  // 1. Create/update driver document in Firestore
  // 2. Set up onDisconnect handler to mark offline
  // 3. Store sessionId for validation

  const driverDoc: Driver = {
    id: data.plateNumber,
    plateNumber: data.plateNumber,
    vehicleType: data.vehicleType,
    location: data.location,
    geohash: encodeGeohash(
      data.location.latitude,
      data.location.longitude,
      APP_CONFIG.defaultGeohashPrecision
    ),
    heading: data.heading,
    speed: data.speed,
    online: true,
    lastSeen: new Date(),
    sessionId: data.sessionId,
  };

  console.log('[Presence] Driver document:', driverDoc);
}

/**
 * Update driver location
 */
export async function updatePresenceLocation(
  plateNumber: string,
  location: GeoPoint,
  heading: number,
  speed: number
): Promise<void> {
  // TODO: Implement with Firebase
  console.log('[Presence] Location update:', { plateNumber, location, heading, speed });

  const geohash = encodeGeohash(
    location.latitude,
    location.longitude,
    APP_CONFIG.defaultGeohashPrecision
  );

  // In real implementation:
  // Update Firestore document with new location, geohash, heading, speed, lastSeen
}

/**
 * Set driver offline
 */
export async function setOffline(plateNumber: string): Promise<void> {
  // TODO: Implement with Firebase
  console.log('[Presence] Setting offline:', plateNumber);

  // In real implementation:
  // Update Firestore document with online: false
}

/**
 * Subscribe to nearby drivers
 * Uses geohash-based queries for efficiency
 */
export function subscribeToNearbyDrivers(
  myLocation: GeoPoint,
  radiusMeters: number,
  onUpdate: (drivers: Driver[]) => void
): () => void {
  // TODO: Implement with Firebase
  console.log('[Presence] Subscribing to nearby drivers:', { myLocation, radiusMeters });

  // In real implementation:
  // 1. Calculate geohash neighbors for current location
  // 2. Query Firestore for drivers in those geohash cells
  // 3. Filter client-side by actual distance
  // 4. Return unsubscribe function

  // Mock: return empty unsubscribe
  return () => {
    console.log('[Presence] Unsubscribing from nearby drivers');
  };
}

/**
 * Check if a specific plate is online and nearby
 */
export async function findDriver(
  plateNumber: string,
  myLocation: GeoPoint,
  maxDistance: number
): Promise<Driver | null> {
  // TODO: Implement with Firebase
  console.log('[Presence] Finding driver:', plateNumber);

  // In real implementation:
  // Query Firestore for driver with matching plate
  // Check if online and within range

  return null;
}
