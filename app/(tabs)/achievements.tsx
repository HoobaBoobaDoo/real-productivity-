import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useGameStore } from '../../store/gameStore';
import { ACHIEVEMENTS, RARITY_COLORS } from '../../constants/achievements';

type Filter = 'all' | 'unlocked' | 'locked';
type Rarity = 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export default function AchievementsScreen() {
  const unlockedAchievements = useGameStore(s => s.unlockedAchievements);
  const [filter, setFilter] = useState<Filter>('all');
  const [rarity, setRarity] = useState<Rarity>('all');

  const filtered = ACHIEVEMENTS.filter(a => {
    const isUnlocked = unlockedAchievements.includes(a.id);
    if (filter === 'unlocked' && !isUnlocked) return false;
    if (filter === 'locked' && isUnlocked) return false;
    if (rarity !== 'all' && a.rarity !== rarity) return false;
    return true;
  });

  const totalXpAvailable = ACHIEVEMENTS.reduce((s, a) => s + a.xpReward, 0);
  const earnedXp = ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id)).reduce((s, a) => s + a.xpReward, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>🏆 Achievements</Text>

        {/* Progress Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{unlockedAchievements.length}</Text>
              <Text style={styles.summaryLabel}>Unlocked</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{ACHIEVEMENTS.length - unlockedAchievements.length}</Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: Colors.gold }]}>{earnedXp.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>XP Earned</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>
            {unlockedAchievements.length} / {ACHIEVEMENTS.length} achievements · {Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}% complete
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(['all', 'unlocked', 'locked'] as Filter[]).map(f => (
            <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rarity Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rarityRow}>
          {(['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'] as Rarity[]).map(r => {
            const color = r === 'all' ? Colors.textDim : RARITY_COLORS[r];
            return (
              <TouchableOpacity
                key={r}
                style={[styles.rarityBtn, rarity === r && { borderColor: color, backgroundColor: color + '22' }]}
                onPress={() => setRarity(r)}
              >
                <Text style={[styles.rarityText, rarity === r && { color }]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Achievement Grid */}
        <View style={styles.grid}>
          {filtered.map(ach => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            const rarityColor = RARITY_COLORS[ach.rarity];
            return (
              <View
                key={ach.id}
                style={[
                  styles.achCard,
                  { borderColor: isUnlocked ? rarityColor + '66' : Colors.border },
                  !isUnlocked && styles.achLocked,
                ]}
              >
                <Text style={[styles.achIcon, !isUnlocked && styles.achIconLocked]}>
                  {isUnlocked ? ach.icon : '🔒'}
                </Text>
                <Text style={[styles.achName, { color: isUnlocked ? rarityColor : Colors.textMuted }]} numberOfLines={2}>
                  {isUnlocked ? ach.name : '???'}
                </Text>
                <Text style={styles.achDesc} numberOfLines={2}>
                  {isUnlocked ? ach.description : 'Keep playing to unlock...'}
                </Text>
                <View style={[styles.rarityTag, { backgroundColor: rarityColor + '22' }]}>
                  <Text style={[styles.rarityTagText, { color: rarityColor }]}>
                    {ach.rarity.toUpperCase()}
                  </Text>
                </View>
                {isUnlocked && (
                  <Text style={styles.achXp}>+{ach.xpReward} XP</Text>
                )}
              </View>
            );
          })}
        </View>

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No achievements match your filters</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 80 },
  pageTitle: { color: Colors.text, fontSize: 24, fontWeight: '900', marginBottom: Spacing.md },
  summaryCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { color: Colors.text, fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: Colors.textDim, fontSize: 11, marginTop: 2 },
  summaryDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  progressTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  progressLabel: { color: Colors.textDim, fontSize: 12, textAlign: 'center' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filterBtn: { flex: 1, padding: 8, borderRadius: Radius.full, backgroundColor: Colors.card, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  filterBtnActive: { backgroundColor: Colors.primary + '33', borderColor: Colors.primary },
  filterText: { color: Colors.textDim, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: Colors.primary },
  rarityRow: { flexDirection: 'row', marginBottom: 14 },
  rarityBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, marginRight: 8, backgroundColor: Colors.card },
  rarityText: { color: Colors.textDim, fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achCard: {
    width: '47%', backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, padding: Spacing.sm + 4, alignItems: 'center',
  },
  achLocked: { opacity: 0.5 },
  achIcon: { fontSize: 32, marginBottom: 6 },
  achIconLocked: { opacity: 0.4 },
  achName: { fontSize: 13, fontWeight: '800', textAlign: 'center', marginBottom: 4, lineHeight: 16 },
  achDesc: { color: Colors.textDim, fontSize: 10, textAlign: 'center', lineHeight: 14, marginBottom: 8 },
  rarityTag: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: Radius.full, marginBottom: 4 },
  rarityTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  achXp: { color: Colors.gold, fontSize: 12, fontWeight: '800' },
  empty: { alignItems: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: Colors.textDim, fontSize: 14 },
});
