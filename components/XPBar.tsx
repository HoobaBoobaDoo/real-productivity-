import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Radius } from '../constants/theme';

interface XPBarProps {
  progress: number; // 0-1
  currentXp: number;
  neededXp: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export default function XPBar({ progress, currentXp, neededXp, color = Colors.xp, height = 10, showLabel = true }: XPBarProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: Math.min(progress, 1),
      useNativeDriver: false,
      damping: 15,
      stiffness: 80,
    }).start();
  }, [progress]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View>
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, { width, backgroundColor: color, height }]} />
        <View style={[styles.glow, { backgroundColor: color, height }]} />
      </View>
      {showLabel && (
        <Text style={styles.label}>{currentXp} / {neededXp} XP</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    borderRadius: Radius.full,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  glow: {
    opacity: 0,
    borderRadius: Radius.full,
  },
  label: {
    color: Colors.textDim,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
});
