/**
 * Session Slice - Manages user session and plate identity
 */

import { StateCreator } from 'zustand';
import type { VehicleType } from '@/types';

export interface SessionState {
  // Session data
  plateNumber: string | null;
  vehicleType: VehicleType;
  sessionId: string;
  agreedToTerms: boolean;
  hasCompletedOnboarding: boolean;
  micPermissionGranted: boolean;
}

export interface SessionActions {
  setPlate: (plate: string, vehicleType: VehicleType) => void;
  setAgreedToTerms: (agreed: boolean) => void;
  setMicPermission: (granted: boolean) => void;
  completeOnboarding: () => void;
  clearSession: () => void;
}

export type SessionSlice = SessionState & SessionActions;

// Generate unique session ID
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const initialState: SessionState = {
  plateNumber: null,
  vehicleType: 'sedan',
  sessionId: generateSessionId(),
  agreedToTerms: false,
  hasCompletedOnboarding: false,
  micPermissionGranted: false,
};

export const createSessionSlice: StateCreator<SessionSlice> = (set) => ({
  ...initialState,

  setPlate: (plate, vehicleType) =>
    set({
      plateNumber: plate.toUpperCase(),
      vehicleType,
    }),

  setAgreedToTerms: (agreed) =>
    set({ agreedToTerms: agreed }),

  setMicPermission: (granted) =>
    set({ micPermissionGranted: granted }),

  completeOnboarding: () =>
    set({ hasCompletedOnboarding: true }),

  clearSession: () =>
    set({
      ...initialState,
      sessionId: generateSessionId(),
    }),
});
