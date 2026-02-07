/**
 * License Plate Screen
 * Enter license plate and vehicle type
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { colors, spacing, fontSize, fontFamily, borderRadius } from '@/theme';
import { Button, Input } from '@/components/common';
import { useSession } from '@/store/hooks';
import type { VehicleType } from '@/types';

const VEHICLE_TYPES: { type: VehicleType; icon: string; label: string }[] = [
  { type: 'sedan', icon: '🚗', label: 'Sedan' },
  { type: 'suv', icon: '🚙', label: 'SUV' },
  { type: 'truck', icon: '🚛', label: 'Truck' },
  { type: 'motorcycle', icon: '🏍️', label: 'Motorcycle' },
];

// Plate validation regex (accepts formats like ABC-1234, ABC 1234, ABC1234)
const PLATE_REGEX = /^[A-Z]{2,4}[\s-]?\d{3,4}$/i;

export const LicensePlateScreen: React.FC = () => {
  const { setPlate, completeOnboarding } = useSession();
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [error, setError] = useState<string | undefined>();

  const validatePlate = useCallback((plate: string): boolean => {
    const cleaned = plate.trim().toUpperCase();
    if (!cleaned) {
      setError('Please enter your license plate');
      return false;
    }
    if (!PLATE_REGEX.test(cleaned)) {
      setError('Invalid plate format (e.g., ABC-1234)');
      return false;
    }
    setError(undefined);
    return true;
  }, []);

  const handlePlateChange = (text: string) => {
    // Auto-format plate (uppercase, add dash after 3 letters)
    let formatted = text.toUpperCase();
    if (formatted.length === 3 && !formatted.includes('-')) {
      formatted += '-';
    }
    setPlateNumber(formatted);
    if (error) {
      validatePlate(formatted);
    }
  };

  const handleStart = () => {
    if (!validatePlate(plateNumber)) {
      return;
    }

    setPlate(plateNumber.toUpperCase(), vehicleType);
    completeOnboarding();
    // Navigation will automatically switch to MainTabs via RootNavigator
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Vehicle</Text>
            <Text style={styles.subtitle}>
              Enter your license plate to identify yourself to nearby drivers
            </Text>
          </View>

          {/* Plate Input */}
          <View style={styles.plateInputContainer}>
            <Text style={styles.plateLabel}>LICENSE PLATE</Text>
            <Input
              value={plateNumber}
              onChangeText={handlePlateChange}
              placeholder="ABC-1234"
              autoCapitalize="characters"
              maxLength={9}
              error={error}
              style={styles.plateInput}
            />
          </View>

          {/* Vehicle Type Selection */}
          <View style={styles.vehicleSection}>
            <Text style={styles.vehicleLabel}>VEHICLE TYPE</Text>
            <View style={styles.vehicleGrid}>
              {VEHICLE_TYPES.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.type}
                  style={[
                    styles.vehicleCard,
                    vehicleType === vehicle.type && styles.vehicleCardSelected,
                  ]}
                  onPress={() => setVehicleType(vehicle.type)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                  <Text
                    style={[
                      styles.vehicleText,
                      vehicleType === vehicle.type && styles.vehicleTextSelected,
                    ]}
                  >
                    {vehicle.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Note */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Your plate is only used during this session to identify you to nearby drivers. No account is created.
            </Text>
          </View>

          {/* Start Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Start Driving"
              onPress={handleStart}
              fullWidth
              size="lg"
              disabled={!plateNumber.trim()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  header: {
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  plateInputContainer: {
    marginBottom: spacing['2xl'],
  },
  plateLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  plateInput: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    fontFamily: fontFamily.mono,
    letterSpacing: 2,
    textAlign: 'center',
    height: 72,
  },
  vehicleSection: {
    marginBottom: spacing['2xl'],
  },
  vehicleLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  vehicleCard: {
    width: '47%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleCardSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.overlay.medium,
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  vehicleText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
  },
  vehicleTextSelected: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  infoIcon: {
    fontSize: 16,
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
});

export default LicensePlateScreen;
