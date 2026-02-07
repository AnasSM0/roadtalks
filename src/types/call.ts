/**
 * Call Types
 */

export type CallStatus = 
  | 'idle'
  | 'initiating'
  | 'ringing'
  | 'connecting'
  | 'active'
  | 'ended'
  | 'failed';

export type SignalType = 'offer' | 'answer' | 'ice';

export interface Call {
  id: string;
  callerId: string;              // Plate of initiator
  calleeId: string;              // Plate of receiver
  status: CallStatus;
  startedAt: Date | null;
  endedAt: Date | null;
}

export interface SignalingMessage {
  id: string;
  type: SignalType;
  sdp?: string;                  // SDP for offer/answer
  candidate?: RTCIceCandidateInit; // ICE candidate
  from: string;                  // Sender plate
  createdAt: Date;
}

export interface CallState {
  status: CallStatus;
  callId: string | null;
  remotePlate: string | null;
  isTransmitting: boolean;
  isMuted: boolean;
  startTime: Date | null;
  duration: number;              // Seconds
  connectionQuality: ConnectionQuality;
}

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';

export interface CallActions {
  initiateCall: (targetPlate: string) => Promise<void>;
  acceptCall: (callId: string) => Promise<void>;
  rejectCall: (callId: string) => Promise<void>;
  endCall: () => void;
  setTransmitting: (transmitting: boolean) => void;
  toggleMute: () => void;
}
