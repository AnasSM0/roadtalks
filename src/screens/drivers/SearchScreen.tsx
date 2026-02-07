/**
 * Search Screen
 * Search for drivers by license plate
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, fontSize, fontFamily, borderRadius } from '@/theme';
import { Card, Button } from '@/components/common';
import type { NearbyDriver, RootStackScreenProps } from '@/types';

type Props = RootStackScreenProps<'Main'>;

const VEHICLE_ICONS: Record<string, string> = {
  sedan: '🚗',
  suv: '🚙',
  truck: '🚛',
  motorcycle: '🏍️',
  van: '🚐',
};

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NearbyDriver[]>([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches] = useState<string[]>(['ABC-1234', 'XYZ-5678']);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    // TODO: Implement real search via Firebase
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock search result
    if (searchQuery.toUpperCase().includes('ABC')) {
      setSearchResults([
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
      ]);
    } else {
      setSearchResults([]);
    }
    setSearching(false);
  }, [searchQuery]);

  const handleConnect = (plate: string) => {
    navigation.navigate('DriveMode', { targetPlate: plate });
  };

  const handleQuickSearch = (plate: string) => {
    setSearchQuery(plate);
    handleSearch();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Driver</Text>
        <Text style={styles.headerSubtitle}>Search by license plate</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter plate number (e.g., ABC-1234)"
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="characters"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <Button
          title="Search"
          onPress={handleSearch}
          size="md"
          loading={searching}
          style={styles.searchButton}
        />
      </View>

      {/* Results or Recent Searches */}
      {searchResults.length > 0 ? (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.vehicleIcon}>{VEHICLE_ICONS[item.vehicleType]}</Text>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultPlate}>{item.plateNumber}</Text>
                    <Text style={styles.resultMeta}>
                      {item.online ? '🟢 Online' : '⚫ Offline'} • {item.distance}m away
                    </Text>
                  </View>
                </View>
                <Button
                  title="📞 Connect"
                  onPress={() => handleConnect(item.plateNumber)}
                  fullWidth
                  size="md"
                />
              </Card>
            )}
          />
        </View>
      ) : searchQuery && !searching ? (
        <View style={styles.noResults}>
          <Text style={styles.noResultsIcon}>🔍</Text>
          <Text style={styles.noResultsTitle}>No Driver Found</Text>
          <Text style={styles.noResultsText}>
            No driver with plate "{searchQuery}" is online nearby
          </Text>
        </View>
      ) : (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
          {recentSearches.map((plate) => (
            <TouchableOpacity
              key={plate}
              style={styles.recentItem}
              onPress={() => handleQuickSearch(plate)}
            >
              <Text style={styles.recentIcon}>🕐</Text>
              <Text style={styles.recentPlate}>{plate}</Text>
              <Text style={styles.recentArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Direct Connect Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Enter the exact license plate of a driver to request a direct connection. Both drivers must be online and within range.
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
  header: {
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.text.muted,
    padding: spacing.sm,
  },
  searchButton: {
    width: 90,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  resultsSection: {
    flex: 1,
  },
  resultCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  vehicleIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultPlate: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    fontFamily: fontFamily.mono,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  resultMeta: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing['4xl'],
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  noResultsTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  noResultsText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  recentSection: {
    flex: 1,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  recentIcon: {
    fontSize: 16,
    marginRight: spacing.md,
  },
  recentPlate: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    fontFamily: fontFamily.mono,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  recentArrow: {
    fontSize: 14,
    color: colors.text.muted,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
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
});

export default SearchScreen;
