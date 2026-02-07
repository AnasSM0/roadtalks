/**
 * Settings Screen
 * User preferences and session management
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';

import { colors, spacing, fontSize, fontFamily, borderRadius } from '@/theme';
import { Card, Button } from '@/components/common';
import { useSession, useDrivers } from '@/store/hooks';

const VEHICLE_ICONS: Record<string, string> = {
  sedan: '🚗',
  suv: '🚙',
  truck: '🚛',
  motorcycle: '🏍️',
  van: '🚐',
};

export const SettingsScreen: React.FC = () => {
  const { plateNumber, vehicleType, clearSession } = useSession();
  const { radiusMeters, setRadius } = useDrivers();

  const handleLogout = () => {
    Alert.alert(
      'End Session',
      'This will clear your session and return to setup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: clearSession,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <Text style={styles.sectionTitle}>PROFILE</Text>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.vehicleIcon}>{VEHICLE_ICONS[vehicleType]}</Text>
            <View style={styles.profileInfo}>
              <Text style={styles.plateText}>{plateNumber || 'NO PLATE'}</Text>
              <Text style={styles.vehicleTypeText}>{vehicleType}</Text>
            </View>
          </View>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1h 24m</Text>
              <Text style={styles.statLabel}>Talk Time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Active</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </Card>

        {/* Discovery Settings */}
        <Text style={styles.sectionTitle}>DISCOVERY</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Discovery Radius</Text>
              <Text style={styles.settingValue}>{radiusMeters}m</Text>
            </View>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={100}
            maximumValue={2000}
            step={100}
            value={radiusMeters}
            onValueChange={setRadius}
            minimumTrackTintColor={colors.accent.primary}
            maximumTrackTintColor={colors.border.default}
            thumbTintColor={colors.accent.primary}
          />
          <Text style={styles.settingHint}>
            Drivers within this range will appear on your radar
          </Text>
        </Card>

        {/* About Section */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📖</Text>
            <Text style={styles.menuLabel}>Terms of Service</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuLabel}>Help & Support</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>📱</Text>
            <Text style={styles.menuLabel}>Version</Text>
            <Text style={styles.menuValue}>1.0.0 (MVP)</Text>
          </View>
        </Card>

        {/* Logout */}
        <Button
          title="End Session"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          size="lg"
          style={styles.logoutButton}
        />

        <Text style={styles.footer}>
          RoadTalk MVP • Session-based identity • No account required
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingBottom: spacing['4xl'],
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  profileCard: {
    marginHorizontal: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  vehicleIcon: {
    fontSize: 48,
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  plateText: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    fontFamily: fontFamily.mono,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  vehicleTypeText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
    textTransform: 'capitalize',
    marginTop: spacing.xs,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.subtle,
  },
  settingsCard: {
    marginHorizontal: spacing.xl,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
  },
  settingValue: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.accent.primary,
    marginTop: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: spacing.md,
  },
  settingHint: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
  },
  menuArrow: {
    fontSize: 14,
    color: colors.text.muted,
  },
  menuValue: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
  },
  logoutButton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing['2xl'],
  },
  footer: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
});

export default SettingsScreen;
