import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { ACHIEVEMENTS, RARITY_COLORS } from '../constants/achievements';
import { AchievementId } from '../constants/achievements';

interface Props {
  achievementId: AchievementId | null;
  onDone: () => void;
}

export default function AchievementToast({ achievementId, onDone }: Props) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!achievementId) return;
    Animated.sequence([
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 12 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(2500),
      Animated.parallel([
        Animated.timing(translateY, { toValue: -120, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(onDone);
  }, [achievementId]);

  const def = achievementId ? ACHIEVEMENTS.find(a => a.id === achievementId) : null;
  if (!def) return null;

  const rarityColor = RARITY_COLORS[def.rarity];

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY }], opacity, borderColor: rarityColor }]}>
      <Text style={styles.icon}>{def.icon}</Text>
      <View style={styles.info}>
        <Text style={styles.unlocked}>Achievement Unlocked!</Text>
        <Text style={[styles.name, { color: rarityColor }]}>{def.name}</Text>
        <Text style={styles.desc}>{def.description}</Text>
      </View>
      <Text style={styles.xp}>+{def.xpReward} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: { fontSize: 32 },
  info: { flex: 1 },
  unlocked: { color: Colors.textDim, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 15, fontWeight: '800', marginTop: 1 },
  desc: { color: Colors.textDim, fontSize: 12, marginTop: 1 },
  xp: { color: Colors.gold, fontWeight: '800', fontSize: 14 },
});
