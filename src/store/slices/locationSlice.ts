/**
 * Location Slice - Manages GPS location and heading
 */

import { StateCreator } from 'zustand';
import type { GeoPoint } from '@/types';

export interface LocationState {
  current: GeoPoint | null;
  heading: number;            // 0-360 degrees
  speed: number;              // km/h
  accuracy: number;           // meters
  lastUpdated: Date | null;
  isTracking: boolean;
  error: string | null;
}

export interface LocationActions {
  updateLocation: (location: GeoPoint, heading: number, speed: number, accuracy: number) => void;
  setTracking: (isTracking: boolean) => void;
  setLocationError: (error: string | null) => void;
  clearLocation: () => void;
}

export type LocationSlice = LocationState & LocationActions;

const initialState: LocationState = {
  current: null,
  heading: 0,
  speed: 0,
  accuracy: 0,
  lastUpdated: null,
  isTracking: false,
  error: null,
};

export const createLocationSlice: StateCreator<LocationSlice> = (set) => ({
  ...initialState,

  updateLocation: (location, heading, speed, accuracy) =>
    set({
      current: location,
      heading,
      speed,
      accuracy,
      lastUpdated: new Date(),
      error: null,
    }),

  setTracking: (isTracking) =>
    set({ isTracking }),

  setLocationError: (error) =>
    set({ error }),

  clearLocation: () =>
    set(initialState),
});
