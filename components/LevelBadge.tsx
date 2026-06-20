import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../constants/theme';
import { levelTitle } from '../utils/xp';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function LevelBadge({ level, size = 'md', color = Colors.primary }: LevelBadgeProps) {
  const s = SIZE_MAP[size];
  return (
    <View style={[styles.badge, { borderColor: color, width: s.box, height: s.box, borderRadius: s.box / 2 }]}>
      <Text style={[styles.level, { fontSize: s.levelFont, color }]}>{level}</Text>
      {size !== 'sm' && <Text style={[styles.title, { fontSize: s.titleFont }]}>{levelTitle(level)}</Text>}
    </View>
  );
}

const SIZE_MAP = {
  sm: { box: 36, levelFont: 13, titleFont: 0 },
  md: { box: 64, levelFont: 22, titleFont: 10 },
  lg: { box: 88, levelFont: 32, titleFont: 11 },
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  level: {
    fontWeight: '800',
    lineHeight: undefined,
  },
  title: {
    color: Colors.textDim,
    fontWeight: '600',
    marginTop: 1,
  },
});
