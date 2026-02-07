/**
 * Onboarding Stack Navigator
 * Handles first-launch flow: permissions → plate entry
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@/theme';
import type { OnboardingStackParamList } from '@/types';

import SafetyPermissionsScreen from '@/screens/onboarding/SafetyPermissionsScreen';
import LicensePlateScreen from '@/screens/onboarding/LicensePlateScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SafetyPermissions" component={SafetyPermissionsScreen} />
      <Stack.Screen name="LicensePlate" component={LicensePlateScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
