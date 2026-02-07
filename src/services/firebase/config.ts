/**
 * Firebase Configuration
 * Replace with your Firebase project credentials
 */

// TODO: Replace with your actual Firebase config
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Firestore collection names
export const COLLECTIONS = {
  DRIVERS: 'drivers',
  CALLS: 'calls',
  SIGNALING: 'signaling',
  AGREEMENTS: 'agreements',
} as const;

// STUN/TURN server configuration for WebRTC
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // TODO: Add TURN server for production
  // {
  //   urls: 'turn:your-turn-server.com:443',
  //   username: 'username',
  //   credential: 'password',
  // },
];

// App configuration
export const APP_CONFIG = {
  // Location
  locationUpdateIntervalMs: 5000, // 5 seconds
  defaultRadiusMeters: 500,
  maxRadiusMeters: 2000,

  // WebRTC
  audioConstraints: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },

  // Timeouts
  connectionTimeoutMs: 30000,
  ringTimeoutMs: 30000,
  signalLossTimeoutMs: 10000,

  // Geohash
  defaultGeohashPrecision: 6,
} as const;
