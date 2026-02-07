/**
 * RoadTalk Spacing & Layout System
 */

// Base spacing unit (4px)
const BASE = 4;

export const spacing = {
  xs: BASE,        // 4
  sm: BASE * 2,    // 8
  md: BASE * 3,    // 12
  lg: BASE * 4,    // 16
  xl: BASE * 5,    // 20
  '2xl': BASE * 6, // 24
  '3xl': BASE * 8, // 32
  '4xl': BASE * 10, // 40
  '5xl': BASE * 12, // 48
  '6xl': BASE * 16, // 64
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
  ptt: 120, // PTT button icon size
} as const;

export const hitSlop = {
  sm: { top: 8, bottom: 8, left: 8, right: 8 },
  md: { top: 12, bottom: 12, left: 12, right: 12 },
  lg: { top: 16, bottom: 16, left: 16, right: 16 },
} as const;

// Common layout dimensions
export const layout = {
  // Screen padding
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.xl,

  // Tab bar
  tabBarHeight: 84,

  // Cards
  cardPadding: spacing.lg,
  cardBorderRadius: borderRadius.xl,

  // Buttons
  buttonHeight: {
    sm: 36,
    md: 48,
    lg: 56,
  },
  pttButtonSize: 200, // Massive PTT button

  // Header
  headerHeight: 56,

  // Bottom sheet
  bottomSheetHandle: 40,
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
