/**
 * Safety Permissions Screen
 * First-launch screen for safety disclaimer and mic permission
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, fontSize, fontFamily, borderRadius } from '@/theme';
import { Button } from '@/components/common';
import { useSession } from '@/store/hooks';
import type { OnboardingScreenProps } from '@/types';

type Props = OnboardingScreenProps<'SafetyPermissions'>;

export const SafetyPermissionsScreen: React.FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const { setAgreedToTerms, setMicPermission, agreedToTerms } = useSession();
  const [accepted, setAccepted] = useState(agreedToTerms);

  const handleRequestPermission = async () => {
    if (!accepted) {
      Alert.alert(
        'Agreement Required',
        'Please agree to the hands-free safety terms to continue.'
      );
      return;
    }

    // TODO: Implement actual permission request
    // For now, simulate permission granted
    setAgreedToTerms(true);
    setMicPermission(true);
    navigation.navigate('LicensePlate');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🛣️</Text>
          <Text style={styles.title}>RoadTalk</Text>
          <Text style={styles.subtitle}>Highway Push-to-Talk</Text>
        </View>

        {/* Safety Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerIcon}>⚠️</Text>
          <Text style={styles.disclaimerTitle}>Hands-Free Only</Text>
          <Text style={styles.disclaimerText}>
            This app is designed for hands-free use only. Do not operate your phone while driving.
            Always keep your eyes on the road and hands on the wheel.
          </Text>
          <Text style={styles.disclaimerText}>
            Use push-to-talk responsibly. You are solely responsible for safe driving.
          </Text>
        </View>

        {/* Permission Card */}
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>🎙️ Microphone Access</Text>
          <Text style={styles.permissionText}>
            RoadTalk needs microphone access for voice communication with nearby drivers.
          </Text>
        </View>

        {/* Agreement Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I agree to use RoadTalk hands-free only and accept responsibility for safe driving
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <Button
          title="Grant Permission & Continue"
          onPress={handleRequestPermission}
          fullWidth
          size="lg"
          disabled={!accepted}
        />

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
  },
  disclaimerCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent.warning,
  },
  disclaimerIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  disclaimerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.accent.warning,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  disclaimerText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  permissionCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  permissionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.default,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  checkmark: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  footer: {
    marginTop: 'auto',
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    textAlign: 'center',
  },
});

export default SafetyPermissionsScreen;
