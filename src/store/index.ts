/**
 * RoadTalk Global Store
 * Zustand store with combined slices
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  SessionSlice,
  createSessionSlice,
  LocationSlice,
  createLocationSlice,
  DriversSlice,
  createDriversSlice,
  CallSlice,
  createCallSlice,
} from './slices';

// Combined store type
export type AppStore = SessionSlice & LocationSlice & DriversSlice & CallSlice;

// Create the store with persistence for session data
export const useStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createSessionSlice(...args),
      ...createLocationSlice(...args),
      ...createDriversSlice(...args),
      ...createCallSlice(...args),
    }),
    {
      name: 'roadtalk-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist session-related data
      partialize: (state) => ({
        plateNumber: state.plateNumber,
        vehicleType: state.vehicleType,
        agreedToTerms: state.agreedToTerms,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        micPermissionGranted: state.micPermissionGranted,
        radiusMeters: state.radiusMeters,
      }),
    }
  )
);

// Export store type for external use
export type { AppStore as StoreState };
