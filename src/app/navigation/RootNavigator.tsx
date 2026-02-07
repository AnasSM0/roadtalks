/**
 * Root Navigator
 * Handles conditional navigation between onboarding and main app
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@/theme';
import { useIsOnboarded } from '@/store/hooks';
import type { RootStackParamList } from '@/types';

import OnboardingStack from './OnboardingStack';
import MainTabs from './MainTabs';
import DriveModeScreen from '@/screens/call/DriveModeScreen';
import ActiveCallScreen from '@/screens/call/ActiveCallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const isOnboarded = useIsOnboarded();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      {!isOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="DriveMode"
            component={DriveModeScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="ActiveCall"
            component={ActiveCallScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
              gestureEnabled: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
