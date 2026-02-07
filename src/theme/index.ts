/**
 * RoadTalk Theme - Central Export
 */

export * from './colors';
export * from './typography';
export * from './spacing';

import { colors } from './colors';
import { fontFamily, fontSize, fontWeight, textStyles } from './typography';
import { spacing, borderRadius, iconSize, layout, hitSlop } from './spacing';

export const theme = {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  textStyles,
  spacing,
  borderRadius,
  iconSize,
  layout,
  hitSlop,
} as const;

export type Theme = typeof theme;
