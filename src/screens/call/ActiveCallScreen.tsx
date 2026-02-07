/**
 * Active Call Screen
 * Full call UI with waveform and controls
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { colors, spacing, fontSize, fontFamily, borderRadius } from '@/theme';
import { useSession, useCall } from '@/store/hooks';
import type { RootStackScreenProps } from '@/types';

type Props = RootStackScreenProps<'ActiveCall'>;

// Waveform visualization component
const WaveformVisualizer: React.FC<{ active: boolean }> = ({ active }) => {
  const bars = 15;
  const animatedValues = useRef(
    Array(bars)
      .fill(0)
      .map(() => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (active) {
      const animations = animatedValues.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 100 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 100 + Math.random() * 200,
              useNativeDriver: true,
            }),
          ])
        )
      );
      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    } else {
      animatedValues.forEach((anim) => anim.setValue(0.3));
    }
  }, [active, animatedValues]);

  return (
    <View style={waveStyles.container}>
      {animatedValues.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            waveStyles.bar,
            {
              transform: [{ scaleY: anim }],
              backgroundColor: active
                ? colors.accent.success
                : colors.text.muted,
            },
          ]}
        />
      ))}
    </View>
  );
};

const waveStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    gap: 4,
  },
  bar: {
    width: 6,
    height: 60,
    borderRadius: 3,
  },
});

export const ActiveCallScreen: React.FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();

  const { plateNumber } = useSession();
  const {
    remotePlate,
    isTransmitting,
    isMuted,
    toggleMute,
    connectionQuality,
    endCall,
  } = useCall();

  const [callDuration, setCallDuration] = useState(0);

  // Call duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEndCall = () => {
    endCall();
    navigation.goBack();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const qualityInfo: Record<string, { icon: string; color: string; label: string }> = {
    excellent: { icon: '●●●●', color: colors.accent.success, label: 'Excellent' },
    good: { icon: '●●●○', color: colors.accent.success, label: 'Good' },
    fair: { icon: '●●○○', color: colors.accent.warning, label: 'Fair' },
    poor: { icon: '●○○○', color: colors.accent.danger, label: 'Poor' },
    disconnected: { icon: '○○○○', color: colors.text.muted, label: 'Lost' },
  };

  const quality = qualityInfo[connectionQuality] || qualityInfo.good;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.qualityBadge}>
          <Text style={[styles.qualityDots, { color: quality.color }]}>
            {quality.icon}
          </Text>
          <Text style={styles.qualityLabel}>{quality.label}</Text>
        </View>
      </View>

      {/* Call Info */}
      <View style={styles.callInfo}>
        <Text style={styles.callLabel}>IN CALL WITH</Text>
        <Text style={styles.remotePlate}>{remotePlate || 'UNKNOWN'}</Text>
        <Text style={styles.callTimer}>{formatDuration(callDuration)}</Text>
      </View>

      {/* Waveform */}
      <View style={styles.waveformContainer}>
        <WaveformVisualizer active={isTransmitting || true} />
        <Text style={styles.waveformLabel}>
          {isTransmitting ? '🎙️ Transmitting...' : '🔊 Receiving...'}
        </Text>
      </View>

      {/* My Plate */}
      <View style={styles.myPlateContainer}>
        <Text style={styles.myPlateLabel}>YOUR PLATE</Text>
        <Text style={styles.myPlate}>{plateNumber}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🔊'}</Text>
          <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <Text style={styles.controlIcon}>📵</Text>
          <Text style={styles.controlLabel}>End</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlIcon}>🔉</Text>
          <Text style={styles.controlLabel}>Speaker</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Reminder */}
      <View style={styles.safetyReminder}>
        <Text style={styles.safetyText}>⚠️ Keep your eyes on the road</Text>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  qualityDots: {
    fontSize: 10,
    letterSpacing: 2,
  },
  qualityLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
  },
  callInfo: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  callLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    fontFamily: fontFamily.primary,
    color: colors.text.muted,
    letterSpacing: 2,
  },
  remotePlate: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: fontFamily.mono,
    color: colors.text.primary,
    letterSpacing: 4,
    marginTop: spacing.lg,
  },
  callTimer: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.mono,
    color: colors.accent.success,
    marginTop: spacing.md,
  },
  waveformContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  waveformLabel: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  myPlateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: colors.accent.primary,
  },
  endCallButton: {
    backgroundColor: colors.accent.danger,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  controlIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  controlLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.primary,
    color: colors.text.secondary,
  },
  safetyReminder: {
    alignItems: 'center',
    paddingBottom: spacing['2xl'],
  },
  safetyText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.primary,
    color: colors.accent.warning,
  },
});

export default ActiveCallScreen;
