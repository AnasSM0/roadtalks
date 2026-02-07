/**
 * Radar Screen
 * Shows nearby drivers within radius
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, fontSize, fontFamily, borderRadius } from '@/theme';
import { Card } from '@/components/common';
import { useDrivers, useSession, useLocation } from '@/store/hooks';
import type { NearbyDriver, RootStackScreenProps } from '@/types';

type Props = RootStackScreenProps<'Main'>;

// Sample mock data for development
const MOCK_DRIVERS: NearbyDriver[] = [
  {
    id: 'ABC-1234',
    plateNumber: 'ABC-1234',
    vehicleType: 'sedan',
    location: { latitude: 33.5731, longitude: -7.5898 },
    geohash: 'evs5m6',
    heading: 45,
    speed: 80,
    online: true,
    lastSeen: new Date(),
    sessionId: 'mock-1',
    distance: 120,
    direction: 'ahead',
    isTransmitting: false,
  },
  {
    id: 'XYZ-5678',
    plateNumber: 'XYZ-5678',
    vehicleType: 'suv',
    location: { latitude: 33.5732, longitude: -7.5899 },
    geohash: 'evs5m6',
    heading: 90,
    speed: 75,
    online: true,
    lastSeen: new Date(),
    sessionId: 'mock-2',
    distance: 250,
    direction: 'ahead-right',
    isTransmitting: true,
  },
  {
    id: 'DEF-9012',
    plateNumber: 'DEF-9012',
    vehicleType: 'truck',
    location: { latitude: 33.5729, longitude: -7.5897 },
    geohash: 'evs5m6',
    heading: 180,
    speed: 60,
    online: true,
    lastSeen: new Date(),
    sessionId: 'mock-3',
    distance: 380,
    direction: 'behind',
    isTransmitting: false,
  },
];

const DIRECTION_ARROWS: Record<string, string> = {
  ahead: '⬆️',
  behind: '⬇️',
  left: '⬅️',
  right: '➡️',
  'ahead-left': '↖️',
  'ahead-right': '↗️',
  'behind-left': '↙️',
  'behind-right': '↘️',
};

const VEHICLE_ICONS: Record<string, string> = {
  sedan: '🚗',
  suv: '🚙',
  truck: '🚛',
  motorcycle: '🏍️',
  van: '🚐',
};

const DriverCard: React.FC<{
  driver: NearbyDriver;
  onConnect: (driver: NearbyDriver) => void;
}> = ({ driver, onConnect }) => (
  <Card style={styles.driverCard} variant="default">
    <View style={styles.driverCardHeader}>
      <View style={styles.driverInfo}>
        <Text style={styles.vehicleIcon}>{VEHICLE_ICONS[driver.vehicleType]}</Text>
        <View>
          <Text style={styles.plateNumber}>{driver.plateNumber}</Text>
          <Text style={styles.vehicleType}>{driver.vehicleType}</Text>
        </View>
      </View>
      {driver.isTransmitting && (
        <View style={styles.transmittingBadge}>
          <Text style={styles.transmittingDot}>🔴</Text>
          <Text style={styles.transmittingText}>LIVE</Text>
        </View>
      )}
    </View>

    <View style={styles.driverCardBody}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{driver.distance}m</Text>
        <Text style={styles.statLabel}>Distance</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{DIRECTION_ARROWS[driver.direction]}</Text>
        <Text style={styles.statLabel}>{driver.direction}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{driver.speed}</Text>
        <Text style={styles.statLabel}>km/h</Text>
      </View>
    </View>

    <TouchableOpacity
      style={styles.connectButton}
      onPress={() => onConnect(driver)}
      activeOpacity={0.8}
    >
      <Text style={styles.connectButtonText}>📞 Connect</Text>
    </TouchableOpacity>
  </Card>
);

export const RadarScreen: React.FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const { plateNumber } = useSession();
  const { nearby, nearbyOnlyFilter, toggleNearbyOnlyFilter, radiusMeters } = useDrivers();
  const { speed, heading, current } = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [drivers, setDrivers] = useState<NearbyDriver[]>(MOCK_DRIVERS);

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch real drivers from Firebase
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleConnect = (driver: NearbyDriver) => {
    navigation.navigate('DriveMode', { targetPlate: driver.plateNumber });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Nearby Drivers</Text>
          <Text style={styles.headerSubtitle}>
            {drivers.length} drivers within {radiusMeters}m
          </Text>
        </View>
        <View style={styles.myPlate}>
          <Text style={styles.myPlateText}>{plateNumber || 'NO PLATE'}</Text>
        </View>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>📍</Text>
          <Text style={styles.statusText}>
            {current ? 'GPS Active' : 'No GPS'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>🧭</Text>
          <Text style={styles.statusText}>{heading}°</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>🚀</Text>
          <Text style={styles.statusText}>{speed} km/h</Text>
        </View>
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Show nearby only ({radiusMeters}m)</Text>
        <Switch
          value={nearbyOnlyFilter}
          onValueChange={toggleNearbyOnlyFilter}
          trackColor={{ false: colors.border.default, true: colors.accent.primary }}
          thumbColor={colors.text.primary}
        />
      </View>

      {/* Driver List */}
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DriverCard driver={item} onConnect={handleConnect} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyTitle}>No Drivers Nearby</Text>
            <Text style={styles.emptyText}>
              Drivers within {radiusMeters}m will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  myPlate: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  myPlateText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    fontFamily: fontFamily.mono,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  filterLabel: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  driverCard: {
    marginBottom: spacing.md,
  },
  driverCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vehicleIcon: {
    fontSize: 32,
  },
  plateNumber: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    fontFamily: fontFamily.mono,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  vehicleType: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    textTransform: 'capitalize',
  },
  transmittingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.danger + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  transmittingDot: {
    fontSize: 8,
  },
  transmittingText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    fontFamily: fontFamily.primary,
    color: colors.accent.danger,
  },
  driverCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
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
    textTransform: 'capitalize',
  },
  connectButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
  },
});

export default RadarScreen;
