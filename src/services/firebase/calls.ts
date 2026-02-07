/**
 * Firebase Calls Service
 * Manages call/signaling state in Firestore
 */

import { COLLECTIONS } from './config';
import type { Call, CallStatus, SignalingMessage } from '@/types';

/**
 * Create a new call
 */
export async function createCall(
  callerId: string,
  calleeId: string
): Promise<string> {
  // TODO: Implement with Firebase
  const callId = `call-${Date.now()}`;
  console.log('[Calls] Creating call:', { callId, callerId, calleeId });

  // In real implementation:
  // 1. Create call document in Firestore
  // 2. Set status to 'ringing'
  // 3. Return call ID

  return callId;
}

/**
 * Update call status
 */
export async function updateCallStatus(
  callId: string,
  status: CallStatus
): Promise<void> {
  // TODO: Implement with Firebase
  console.log('[Calls] Updating status:', { callId, status });

  // In real implementation:
  // Update call document in Firestore
}

/**
 * Add signaling message (offer, answer, or ICE candidate)
 */
export async function addSignalingMessage(
  callId: string,
  message: Omit<SignalingMessage, 'id' | 'createdAt'>
): Promise<void> {
  // TODO: Implement with Firebase
  console.log('[Calls] Adding signaling message:', { callId, message });

  // In real implementation:
  // Add to signaling subcollection
}

/**
 * Subscribe to incoming calls for a plate
 */
export function subscribeToIncomingCalls(
  plateNumber: string,
  onCall: (call: Call) => void
): () => void {
  // TODO: Implement with Firebase
  console.log('[Calls] Subscribing to incoming calls for:', plateNumber);

  // In real implementation:
  // Listen for calls where calleeId === plateNumber and status === 'ringing'

  return () => {
    console.log('[Calls] Unsubscribing from incoming calls');
  };
}

/**
 * Subscribe to signaling messages for a call
 */
export function subscribeToSignaling(
  callId: string,
  myPlate: string,
  onMessage: (message: SignalingMessage) => void
): () => void {
  // TODO: Implement with Firebase
  console.log('[Calls] Subscribing to signaling for call:', callId);

  // In real implementation:
  // Listen for new signaling messages not from self

  return () => {
    console.log('[Calls] Unsubscribing from signaling');
  };
}

/**
 * Subscribe to call status changes
 */
export function subscribeToCallStatus(
  callId: string,
  onStatusChange: (status: CallStatus) => void
): () => void {
  // TODO: Implement with Firebase
  console.log('[Calls] Subscribing to call status:', callId);

  // In real implementation:
  // Listen for changes to the call document

  return () => {
    console.log('[Calls] Unsubscribing from call status');
  };
}

/**
 * End a call
 */
export async function endCall(callId: string): Promise<void> {
  // TODO: Implement with Firebase
  console.log('[Calls] Ending call:', callId);

  // In real implementation:
  // Set status to 'ended' and endedAt timestamp
  await updateCallStatus(callId, 'ended');
}
