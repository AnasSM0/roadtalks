/**
 * Main Tab Navigator
 * Bottom tab navigation for Radar, Drivers, Settings
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text } from 'react-native';

import { colors, spacing, layout } from '@/theme';
import type { MainTabParamList } from '@/types';

// Import screens (will create next)
import RadarScreen from '@/screens/radar/RadarScreen';
import SearchScreen from '@/screens/drivers/SearchScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icons
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Radar: '📡',
    Drivers: '🚗',
    Settings: '⚙️',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconFocused]}>
      <Text style={styles.iconText}>{icons[name] || '●'}</Text>
    </View>
  );
};

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="Radar"
        component={RadarScreen}
        options={{ tabBarLabel: 'Radar' }}
      />
      <Tab.Screen
        name="Drivers"
        component={SearchScreen}
        options={{ tabBarLabel: 'Drivers' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopColor: colors.border.subtle,
    borderTopWidth: 1,
    height: layout.tabBarHeight,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconFocused: {
    backgroundColor: colors.overlay.medium,
  },
  iconText: {
    fontSize: 20,
  },
});

export default MainTabs;
