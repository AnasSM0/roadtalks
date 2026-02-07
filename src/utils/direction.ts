/**
 * Direction Calculation Utilities
 */

import type { GeoPoint, RelativeDirection } from '@/types';
import { calculateBearing } from './distance';

/**
 * Calculate relative direction from one driver to another
 * @param from - Current driver's position
 * @param fromHeading - Current driver's heading (0-360, 0=North)
 * @param to - Target driver's position
 * @returns Relative direction (ahead, behind, left, right, or diagonal)
 */
export function calculateRelativeDirection(
  from: GeoPoint,
  fromHeading: number,
  to: GeoPoint
): RelativeDirection {
  // Calculate absolute bearing to target
  const absoluteBearing = calculateBearing(from, to);

  // Calculate relative angle (how far target is from our heading)
  let relativeAngle = absoluteBearing - fromHeading;

  // Normalize to -180 to 180
  while (relativeAngle > 180) relativeAngle -= 360;
  while (relativeAngle < -180) relativeAngle += 360;

  // Determine direction based on angle
  const absAngle = Math.abs(relativeAngle);

  if (absAngle <= 22.5) {
    return 'ahead';
  } else if (absAngle >= 157.5) {
    return 'behind';
  } else if (relativeAngle > 0) {
    // Right side
    if (absAngle < 67.5) {
      return 'ahead-right';
    } else if (absAngle > 112.5) {
      return 'behind-right';
    } else {
      return 'right';
    }
  } else {
    // Left side
    if (absAngle < 67.5) {
      return 'ahead-left';
    } else if (absAngle > 112.5) {
      return 'behind-left';
    } else {
      return 'left';
    }
  }
}

/**
 * Get arrow emoji for direction
 */
export function getDirectionArrow(direction: RelativeDirection): string {
  const arrows: Record<RelativeDirection, string> = {
    ahead: '⬆️',
    behind: '⬇️',
    left: '⬅️',
    right: '➡️',
    'ahead-left': '↖️',
    'ahead-right': '↗️',
    'behind-left': '↙️',
    'behind-right': '↘️',
  };
  return arrows[direction];
}

/**
 * Get human-readable direction label
 */
export function getDirectionLabel(direction: RelativeDirection): string {
  const labels: Record<RelativeDirection, string> = {
    ahead: 'Ahead',
    behind: 'Behind',
    left: 'Left',
    right: 'Right',
    'ahead-left': 'Ahead Left',
    'ahead-right': 'Ahead Right',
    'behind-left': 'Behind Left',
    'behind-right': 'Behind Right',
  };
  return labels[direction];
}
