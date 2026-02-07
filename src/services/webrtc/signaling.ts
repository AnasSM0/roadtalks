/**
 * WebRTC Signaling Service
 * Orchestrates the signaling flow between peers via Firebase
 */

import { webRTCService } from './rtcService';
import {
  createCall,
  updateCallStatus,
  addSignalingMessage,
  subscribeToSignaling,
  subscribeToCallStatus,
  endCall as firebaseEndCall,
} from '../firebase/calls';
import type { CallStatus, SignalingMessage } from '@/types';

interface SignalingCallbacks {
  onStateChange: (status: CallStatus) => void;
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (error: Error) => void;
}

class SignalingService {
  private callId: string | null = null;
  private myPlate: string | null = null;
  private remotePlate: string | null = null;
  private callbacks: Partial<SignalingCallbacks> = {};
  private unsubscribeSignaling: (() => void) | null = null;
  private unsubscribeStatus: (() => void) | null = null;

  /**
   * Initiate a call to another driver (caller flow)
   */
  async initiateCall(
    myPlate: string,
    targetPlate: string,
    callbacks: Partial<SignalingCallbacks>
  ): Promise<string | null> {
    try {
      this.myPlate = myPlate;
      this.remotePlate = targetPlate;
      this.callbacks = callbacks;

      // Create call in Firebase
      this.callId = await createCall(myPlate, targetPlate);
      console.log('[Signaling] Call created:', this.callId);

      // Initialize WebRTC
      await webRTCService.initialize({
        onStateChange: (state) => {
          console.log('[Signaling] WebRTC state:', state);
          if (state === 'connected') {
            this.callbacks.onConnected?.();
          } else if (state === 'disconnected' || state === 'failed') {
            this.callbacks.onDisconnected?.();
          }
        },
        onIceCandidate: async (candidate) => {
          // Send ICE candidate via Firebase
          await addSignalingMessage(this.callId!, {
            type: 'ice',
            candidate,
            from: myPlate,
          });
        },
        onError: (error) => {
          this.callbacks.onError?.(error);
        },
      });

      // Get local audio stream
      await webRTCService.getLocalStream();

      // Create and send offer
      const offer = await webRTCService.createOffer();
      if (offer) {
        await addSignalingMessage(this.callId, {
          type: 'offer',
          sdp: offer.sdp,
          from: myPlate,
        });
      }

      // Subscribe to signaling messages (for answer and ICE candidates)
      this.subscribeToMessages();

      // Subscribe to call status changes
      this.subscribeToStatus();

      this.callbacks.onStateChange?.('initiating');
      return this.callId;
    } catch (error) {
      console.error('[Signaling] Failed to initiate call:', error);
      this.callbacks.onError?.(error as Error);
      return null;
    }
  }

  /**
   * Accept an incoming call (callee flow)
   */
  async acceptCall(
    callId: string,
    myPlate: string,
    callerPlate: string,
    callbacks: Partial<SignalingCallbacks>
  ): Promise<void> {
    try {
      this.callId = callId;
      this.myPlate = myPlate;
      this.remotePlate = callerPlate;
      this.callbacks = callbacks;

      // Initialize WebRTC
      await webRTCService.initialize({
        onStateChange: (state) => {
          console.log('[Signaling] WebRTC state:', state);
          if (state === 'connected') {
            this.callbacks.onConnected?.();
          } else if (state === 'disconnected' || state === 'failed') {
            this.callbacks.onDisconnected?.();
          }
        },
        onIceCandidate: async (candidate) => {
          await addSignalingMessage(this.callId!, {
            type: 'ice',
            candidate,
            from: myPlate,
          });
        },
        onError: (error) => {
          this.callbacks.onError?.(error);
        },
      });

      // Get local audio stream
      await webRTCService.getLocalStream();

      // Subscribe to signaling messages (to get the offer)
      this.subscribeToMessages();

      // Update call status
      await updateCallStatus(callId, 'connecting');
      this.callbacks.onStateChange?.('connecting');
    } catch (error) {
      console.error('[Signaling] Failed to accept call:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Handle incoming signaling message
   */
  private async handleSignalingMessage(message: SignalingMessage): Promise<void> {
    console.log('[Signaling] Received message:', message.type);

    switch (message.type) {
      case 'offer':
        // Handle offer and send answer
        const answer = await webRTCService.handleOffer({
          type: 'offer',
          sdp: message.sdp,
        });
        if (answer) {
          await addSignalingMessage(this.callId!, {
            type: 'answer',
            sdp: answer.sdp,
            from: this.myPlate!,
          });
        }
        break;

      case 'answer':
        // Handle answer
        await webRTCService.handleAnswer({
          type: 'answer',
          sdp: message.sdp,
        });
        // Call is now connecting
        await updateCallStatus(this.callId!, 'active');
        this.callbacks.onStateChange?.('active');
        break;

      case 'ice':
        // Add ICE candidate
        if (message.candidate) {
          await webRTCService.addIceCandidate(message.candidate);
        }
        break;
    }
  }

  /**
   * Subscribe to signaling messages
   */
  private subscribeToMessages(): void {
    if (!this.callId || !this.myPlate) return;

    this.unsubscribeSignaling = subscribeToSignaling(
      this.callId,
      this.myPlate,
      (message) => this.handleSignalingMessage(message)
    );
  }

  /**
   * Subscribe to call status changes
   */
  private subscribeToStatus(): void {
    if (!this.callId) return;

    this.unsubscribeStatus = subscribeToCallStatus(this.callId, (status) => {
      console.log('[Signaling] Call status changed:', status);
      this.callbacks.onStateChange?.(status);

      if (status === 'ended') {
        this.cleanup();
      }
    });
  }

  /**
   * Enable/disable PTT transmission
   */
  setTransmitting(transmitting: boolean): void {
    webRTCService.setAudioEnabled(transmitting);
  }

  /**
   * Toggle mute
   */
  setMuted(muted: boolean): void {
    webRTCService.setMuted(muted);
  }

  /**
   * End the call
   */
  async endCall(): Promise<void> {
    if (this.callId) {
      await firebaseEndCall(this.callId);
    }
    this.cleanup();
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.unsubscribeSignaling?.();
    this.unsubscribeStatus?.();
    webRTCService.close();

    this.callId = null;
    this.myPlate = null;
    this.remotePlate = null;
    this.callbacks = {};
    this.unsubscribeSignaling = null;
    this.unsubscribeStatus = null;

    console.log('[Signaling] Cleaned up');
  }
}

// Export singleton instance
export const signalingService = new SignalingService();

export default signalingService;
