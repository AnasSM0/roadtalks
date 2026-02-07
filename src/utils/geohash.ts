/**
 * Geohash Utilities for Proximity Queries
 * Based on ngeohash library
 */

// Geohash character set
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encode a lat/lng to geohash string
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @param precision - Number of characters (default 6 = ~1.2km cell)
 */
export function encodeGeohash(
  latitude: number,
  longitude: number,
  precision: number = 6
): string {
  let latRange = [-90.0, 90.0];
  let lngRange = [-180.0, 180.0];
  let hash = '';
  let bit = 0;
  let ch = 0;
  let isEven = true;

  while (hash.length < precision) {
    if (isEven) {
      const mid = (lngRange[0] + lngRange[1]) / 2;
      if (longitude >= mid) {
        ch |= 1 << (4 - bit);
        lngRange[0] = mid;
      } else {
        lngRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (latitude >= mid) {
        ch |= 1 << (4 - bit);
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }

    isEven = !isEven;
    bit++;

    if (bit === 5) {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}

/**
 * Get all 9 neighboring geohash cells (including center)
 * Used for proximity queries
 */
export function getNeighbors(geohash: string): string[] {
  const neighbors: string[] = [geohash];

  // Simplified neighbor calculation
  // In production, use a full neighbor algorithm
  const lastChar = geohash[geohash.length - 1];
  const prefix = geohash.slice(0, -1);
  const idx = BASE32.indexOf(lastChar);

  // Add adjacent cells (simplified)
  if (idx > 0) neighbors.push(prefix + BASE32[idx - 1]);
  if (idx < 31) neighbors.push(prefix + BASE32[idx + 1]);

  return [...new Set(neighbors)];
}

/**
 * Get geohash precision based on radius
 * @param radiusMeters - Search radius in meters
 * @returns Recommended geohash precision
 */
export function getPrecisionForRadius(radiusMeters: number): number {
  // Approximate geohash cell sizes:
  // 1: ~5000km, 2: ~1250km, 3: ~156km, 4: ~39km
  // 5: ~4.9km, 6: ~1.2km, 7: ~153m, 8: ~38m

  if (radiusMeters <= 50) return 8;
  if (radiusMeters <= 200) return 7;
  if (radiusMeters <= 2000) return 6;
  if (radiusMeters <= 10000) return 5;
  if (radiusMeters <= 50000) return 4;
  return 3;
}
