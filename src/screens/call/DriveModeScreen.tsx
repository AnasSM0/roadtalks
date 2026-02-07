/**
 * Drive Mode Screen
 * PTT interface with massive HOLD TO TALK button
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { colors, spacing, fontSize, fontFamily, borderRadius, layout } from '@/theme';
import { useSession, useLocation, useCall } from '@/store/hooks';
import type { RootStackScreenProps } from '@/types';

type Props = RootStackScreenProps<'DriveMode'>;

export const DriveModeScreen: React.FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();
  const { targetPlate } = route.params;

  const { plateNumber } = useSession();
  const { speed, heading, current } = useLocation();
  const { isTransmitting, setTransmitting, status, startCall, endCall } = useCall();

  const [connecting, setConnecting] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Animation for PTT button glow
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Simulate connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnecting(false);
      startCall(`call-${Date.now()}`, targetPlate);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (!connecting && status === 'active') {
      const interval = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [connecting, status]);

  // Glow animation when transmitting
  useEffect(() => {
    if (isTransmitting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.stopAnimation();
      pulseAnim.stopAnimation();
      glowAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [isTransmitting]);

  const handlePressIn = useCallback(() => {
    if (connecting) return;
    setTransmitting(true);
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(10);
    } else {
      Vibration.vibrate(50);
    }
  }, [connecting, setTransmitting]);

  const handlePressOut = useCallback(() => {
    setTransmitting(false);
  }, [setTransmitting]);

  const handleEndCall = () => {
    endCall();
    navigation.goBack();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>🚀</Text>
          <Text style={styles.statusValue}>{speed}</Text>
          <Text style={styles.statusUnit}>km/h</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>📡</Text>
          <Text style={styles.statusValue}>●</Text>
          <Text style={styles.statusUnit}>
            {current ? 'GPS' : 'No GPS'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>📶</Text>
          <Text style={styles.statusValue}>●●●</Text>
          <Text style={styles.statusUnit}>Strong</Text>
        </View>
      </View>

      {/* Connection Info */}
      <View style={styles.connectionInfo}>
        <Text style={styles.connectedToLabel}>
          {connecting ? 'CONNECTING TO' : 'CONNECTED TO'}
        </Text>
        <Text style={styles.targetPlate}>{targetPlate}</Text>
        {!connecting && (
          <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        )}
      </View>

      {/* PTT Button */}
      <View style={styles.pttContainer}>
        {/* Glow Effect */}
        {isTransmitting && (
          <Animated.View
            style={[
              styles.pttGlow,
              {
                opacity: glowOpacity,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        )}

        <TouchableOpacity
          style={[
            styles.pttButton,
            isTransmitting && styles.pttButtonActive,
            connecting && styles.pttButtonDisabled,
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          disabled={connecting}
        >
          <Text style={styles.pttIcon}>{isTransmitting ? '🎙️' : '🎤'}</Text>
          <Text style={styles.pttText}>
            {connecting ? 'CONNECTING...' : isTransmitting ? 'TRANSMITTING' : 'HOLD TO TALK'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transmit Indicator */}
      {isTransmitting && (
        <View style={styles.transmitIndicator}>
          <Text style={styles.transmitText}>🔴 LIVE</Text>
        </View>
      )}

      {/* My Plate */}
      <View style={styles.myPlateContainer}>
        <Text style={styles.myPlateLabel}>YOUR PLATE</Text>
        <Text style={styles.myPlate}>{plateNumber}</Text>
      </View>

      {/* End Call Button */}
      <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
        <Text style={styles.endCallIcon}>📵</Text>
        <Text style={styles.endCallText}>End Call</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
  },
  statusUnit: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
  },
  connectionInfo: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  connectedToLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    letterSpacing: 2,
  },
  targetPlate: {
    fontSize: fontSize['5xl'],
    fontWeight: '700',
    fontFamily: fontFamily.mono,
    color: colors.text.primary,
    letterSpacing: 4,
    marginTop: spacing.md,
  },
  callDuration: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.mono,
    color: colors.accent.success,
    marginTop: spacing.sm,
  },
  pttContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pttGlow: {
    position: 'absolute',
    width: layout.pttButtonSize + 60,
    height: layout.pttButtonSize + 60,
    borderRadius: (layout.pttButtonSize + 60) / 2,
    backgroundColor: colors.accent.success,
  },
  pttButton: {
    width: layout.pttButtonSize,
    height: layout.pttButtonSize,
    borderRadius: layout.pttButtonSize / 2,
    backgroundColor: colors.background.tertiary,
    borderWidth: 4,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pttButtonActive: {
    backgroundColor: colors.accent.success,
    borderColor: colors.accent.success,
  },
  pttButtonDisabled: {
    opacity: 0.5,
  },
  pttIcon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  pttText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  transmitIndicator: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  transmitText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    fontFamily: fontFamily.primary,
    color: colors.accent.danger,
    letterSpacing: 2,
  },
  myPlateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  myPlateLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  myPlate: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    fontFamily: fontFamily.mono,
    color: colors.text.secondary,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  endCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.danger,
    marginHorizontal: spacing.xl,
    marginBottom: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  endCallIcon: {
    fontSize: 20,
  },
  endCallText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.primary,
  },
});

export default DriveModeScreen;
