/**
 * Driver Types
 */

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van';

export type DriverStatus = 'online' | 'offline' | 'busy';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Driver {
  id: string;                    // Same as plateNumber
  plateNumber: string;           // e.g., "ABC-1234"
  vehicleType: VehicleType;
  location: GeoPoint;
  geohash: string;               // For proximity queries
  heading: number;               // 0-360 degrees
  speed: number;                 // km/h
  online: boolean;
  lastSeen: Date;
  sessionId: string;
}

export interface NearbyDriver extends Driver {
  distance: number;              // Meters from current user
  direction: RelativeDirection;  // Direction from current user
  isTransmitting: boolean;       // Currently speaking
}

export type RelativeDirection = 
  | 'ahead'
  | 'behind'
  | 'left'
  | 'right'
  | 'ahead-left'
  | 'ahead-right'
  | 'behind-left'
  | 'behind-right';

export interface DriverCardProps {
  driver: NearbyDriver;
  onPress: (driver: NearbyDriver) => void;
  isSelected?: boolean;
}
