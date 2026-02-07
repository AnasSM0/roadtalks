/**
 * Call Slice - Manages voice call state
 */

import { StateCreator } from 'zustand';
import type { CallStatus, ConnectionQuality } from '@/types';

export interface CallState {
  status: CallStatus;
  callId: string | null;
  remotePlate: string | null;
  isTransmitting: boolean;
  isMuted: boolean;
  startTime: Date | null;
  duration: number;            // Seconds
  connectionQuality: ConnectionQuality;
}

export interface CallActions {
  setCallStatus: (status: CallStatus) => void;
  startCall: (callId: string, remotePlate: string) => void;
  setTransmitting: (transmitting: boolean) => void;
  toggleMute: () => void;
  updateDuration: (duration: number) => void;
  setConnectionQuality: (quality: ConnectionQuality) => void;
  endCall: () => void;
  resetCall: () => void;
}

export type CallSlice = CallState & CallActions;

const initialState: CallState = {
  status: 'idle',
  callId: null,
  remotePlate: null,
  isTransmitting: false,
  isMuted: false,
  startTime: null,
  duration: 0,
  connectionQuality: 'good',
};

export const createCallSlice: StateCreator<CallSlice> = (set) => ({
  ...initialState,

  setCallStatus: (status) =>
    set({ status }),

  startCall: (callId, remotePlate) =>
    set({
      status: 'active',
      callId,
      remotePlate,
      startTime: new Date(),
      duration: 0,
      isTransmitting: false,
      isMuted: false,
      connectionQuality: 'good',
    }),

  setTransmitting: (transmitting) =>
    set({ isTransmitting: transmitting }),

  toggleMute: () =>
    set((state) => ({ isMuted: !state.isMuted })),

  updateDuration: (duration) =>
    set({ duration }),

  setConnectionQuality: (quality) =>
    set({ connectionQuality: quality }),

  endCall: () =>
    set({
      status: 'ended',
    }),

  resetCall: () =>
    set(initialState),
});
