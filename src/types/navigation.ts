/**
 * Navigation Types
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Root Stack (handles onboarding vs main app)
export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  DriveMode: { targetPlate: string };
  ActiveCall: { callId: string };
};

// Onboarding Stack
export type OnboardingStackParamList = {
  SafetyPermissions: undefined;
  LicensePlate: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Radar: undefined;
  Drivers: undefined;
  Settings: undefined;
};

// Drivers Stack (nested in tab)
export type DriversStackParamList = {
  Search: undefined;
  DirectConnect: { plateNumber: string };
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> = 
  NativeStackScreenProps<OnboardingStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Declare global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
