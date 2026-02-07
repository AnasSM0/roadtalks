/**
 * Drivers Slice - Manages nearby drivers discovery
 */

import { StateCreator } from 'zustand';
import type { NearbyDriver } from '@/types';

export interface DriversState {
  nearby: NearbyDriver[];
  loading: boolean;
  radiusMeters: number;
  nearbyOnlyFilter: boolean;
  error: string | null;
  lastRefreshed: Date | null;
}

export interface DriversActions {
  setNearbyDrivers: (drivers: NearbyDriver[]) => void;
  addDriver: (driver: NearbyDriver) => void;
  removeDriver: (plateNumber: string) => void;
  updateDriver: (plateNumber: string, updates: Partial<NearbyDriver>) => void;
  setLoading: (loading: boolean) => void;
  setRadius: (meters: number) => void;
  toggleNearbyOnlyFilter: () => void;
  setDriversError: (error: string | null) => void;
  clearDrivers: () => void;
}

export type DriversSlice = DriversState & DriversActions;

const initialState: DriversState = {
  nearby: [],
  loading: false,
  radiusMeters: 500,           // Default 500m radius
  nearbyOnlyFilter: false,
  error: null,
  lastRefreshed: null,
};

export const createDriversSlice: StateCreator<DriversSlice> = (set, get) => ({
  ...initialState,

  setNearbyDrivers: (drivers) =>
    set({
      nearby: drivers,
      lastRefreshed: new Date(),
      loading: false,
    }),

  addDriver: (driver) =>
    set((state) => ({
      nearby: [...state.nearby.filter((d) => d.plateNumber !== driver.plateNumber), driver],
    })),

  removeDriver: (plateNumber) =>
    set((state) => ({
      nearby: state.nearby.filter((d) => d.plateNumber !== plateNumber),
    })),

  updateDriver: (plateNumber, updates) =>
    set((state) => ({
      nearby: state.nearby.map((d) =>
        d.plateNumber === plateNumber ? { ...d, ...updates } : d
      ),
    })),

  setLoading: (loading) =>
    set({ loading }),

  setRadius: (meters) =>
    set({ radiusMeters: meters }),

  toggleNearbyOnlyFilter: () =>
    set((state) => ({ nearbyOnlyFilter: !state.nearbyOnlyFilter })),

  setDriversError: (error) =>
    set({ error, loading: false }),

  clearDrivers: () =>
    set(initialState),
});
