/**
 * Plate Validation Utility
 */

// Common plate formats:
// - US: ABC-1234, ABC 1234, ABC1234
// - EU: AB-123-CD, AB 123 CD
// - Generic: 2-4 letters followed by 3-4 digits

export const PLATE_PATTERNS = {
  // Standard format: 2-4 letters, optional separator, 3-4 digits
  standard: /^[A-Z]{2,4}[\s-]?\d{3,4}$/i,
  // US style: 3 letters, separator, 4 digits
  us: /^[A-Z]{3}[\s-]?\d{4}$/i,
  // European style: 2 letters, 3 digits, 2 letters
  eu: /^[A-Z]{2}[\s-]?\d{3}[\s-]?[A-Z]{2}$/i,
  // Generic: alphanumeric 5-8 chars
  generic: /^[A-Z0-9]{5,8}$/i,
};

export interface PlateValidationResult {
  isValid: boolean;
  formatted: string;
  error?: string;
}

/**
 * Validate and format a license plate number
 */
export function validatePlate(input: string): PlateValidationResult {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, ' ');

  if (!cleaned) {
    return {
      isValid: false,
      formatted: '',
      error: 'Please enter your license plate',
    };
  }

  if (cleaned.length < 5) {
    return {
      isValid: false,
      formatted: cleaned,
      error: 'Plate number too short',
    };
  }

  if (cleaned.length > 10) {
    return {
      isValid: false,
      formatted: cleaned,
      error: 'Plate number too long',
    };
  }

  // Check against known patterns
  const isValidFormat = Object.values(PLATE_PATTERNS).some((pattern) =>
    pattern.test(cleaned.replace(/[\s-]/g, ''))
  );

  if (!isValidFormat) {
    return {
      isValid: false,
      formatted: cleaned,
      error: 'Invalid plate format (e.g., ABC-1234)',
    };
  }

  // Format: Add dash after letters if not present
  let formatted = cleaned;
  if (!formatted.includes('-') && !formatted.includes(' ')) {
    const match = formatted.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      formatted = `${match[1]}-${match[2]}`;
    }
  }

  return {
    isValid: true,
    formatted,
  };
}

/**
 * Format plate for display (uppercase with dash)
 */
export function formatPlateDisplay(plate: string): string {
  return plate.toUpperCase().replace(/\s/g, '-');
}
