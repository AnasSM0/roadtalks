/**
 * Store Hooks - Typed selectors for the store
 */

import { useStore } from './index';

// Session hooks
export const useSession = () =>
  useStore((state) => ({
    plateNumber: state.plateNumber,
    vehicleType: state.vehicleType,
    sessionId: state.sessionId,
    agreedToTerms: state.agreedToTerms,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    micPermissionGranted: state.micPermissionGranted,
    setPlate: state.setPlate,
    setAgreedToTerms: state.setAgreedToTerms,
    setMicPermission: state.setMicPermission,
    completeOnboarding: state.completeOnboarding,
    clearSession: state.clearSession,
  }));

// Location hooks
export const useLocation = () =>
  useStore((state) => ({
    current: state.current,
    heading: state.heading,
    speed: state.speed,
    accuracy: state.accuracy,
    lastUpdated: state.lastUpdated,
    isTracking: state.isTracking,
    error: state.error,
    updateLocation: state.updateLocation,
    setTracking: state.setTracking,
    setLocationError: state.setLocationError,
    clearLocation: state.clearLocation,
  }));

// Nearby drivers hooks
export const useDrivers = () =>
  useStore((state) => ({
    nearby: state.nearby,
    loading: state.loading,
    radiusMeters: state.radiusMeters,
    nearbyOnlyFilter: state.nearbyOnlyFilter,
    error: state.error,
    lastRefreshed: state.lastRefreshed,
    setNearbyDrivers: state.setNearbyDrivers,
    addDriver: state.addDriver,
    removeDriver: state.removeDriver,
    updateDriver: state.updateDriver,
    setLoading: state.setLoading,
    setRadius: state.setRadius,
    toggleNearbyOnlyFilter: state.toggleNearbyOnlyFilter,
    setDriversError: state.setDriversError,
    clearDrivers: state.clearDrivers,
  }));

// Call hooks
export const useCall = () =>
  useStore((state) => ({
    status: state.status,
    callId: state.callId,
    remotePlate: state.remotePlate,
    isTransmitting: state.isTransmitting,
    isMuted: state.isMuted,
    startTime: state.startTime,
    duration: state.duration,
    connectionQuality: state.connectionQuality,
    setCallStatus: state.setCallStatus,
    startCall: state.startCall,
    setTransmitting: state.setTransmitting,
    toggleMute: state.toggleMute,
    updateDuration: state.updateDuration,
    setConnectionQuality: state.setConnectionQuality,
    endCall: state.endCall,
    resetCall: state.resetCall,
  }));

// Quick access hooks
export const usePlateNumber = () => useStore((state) => state.plateNumber);
export const useIsOnboarded = () => useStore((state) => state.hasCompletedOnboarding);
export const useCallStatus = () => useStore((state) => state.status);
export const useIsTransmitting = () => useStore((state) => state.isTransmitting);
