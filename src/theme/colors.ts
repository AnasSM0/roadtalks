/**
 * RoadTalk Color Palette
 * Dark theme optimized for automotive use
 */

export const colors = {
  // Backgrounds
  background: {
    primary: '#0B101B',    // Deep Midnight Navy - Main background
    secondary: '#151A28',  // Elevated surfaces
    tertiary: '#1E2433',   // Cards and containers
    elevated: '#252D3D',   // Modal/overlay background
  },

  // Accent Colors
  accent: {
    primary: '#2563EB',    // Electric Blue - Primary actions
    success: '#22C55E',    // Safety Green - Active voice/transmit
    danger: '#EF4444',     // Red - Alerts, end call, errors
    warning: '#F59E0B',    // Amber - Warnings
    info: '#3B82F6',       // Blue - Informational
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',    // Primary text
    secondary: '#94A3B8',  // Secondary text
    muted: '#64748B',      // Muted/disabled text
    inverse: '#0B101B',    // Text on light backgrounds
  },

  // Border Colors
  border: {
    default: '#2D3748',    // Default borders
    subtle: '#1E2433',     // Subtle dividers
    focus: '#2563EB',      // Focused state
    success: '#22C55E',    // Active/success border
    danger: '#EF4444',     // Error border
  },

  // Status Colors
  status: {
    online: '#22C55E',     // User online
    offline: '#64748B',    // User offline
    busy: '#EF4444',       // User on call
    away: '#F59E0B',       // User away
  },

  // Gradient presets
  gradients: {
    primaryButton: ['#2563EB', '#1D4ED8'],
    successGlow: ['#22C55E', '#16A34A'],
    dangerButton: ['#EF4444', '#DC2626'],
    cardOverlay: ['rgba(11, 16, 27, 0)', 'rgba(11, 16, 27, 0.9)'],
  },

  // Semi-transparent overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.5)',
    backdrop: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export type Colors = typeof colors;
