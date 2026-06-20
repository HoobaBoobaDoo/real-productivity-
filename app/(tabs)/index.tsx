import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useGameStore, useCurrentWeekLogs, useMinutesForCategoryThisWeek } from '../../store/gameStore';
import { levelFromXp, levelTitle } from '../../utils/xp';
import XPBar from '../../components/XPBar';
import LevelBadge from '../../components/LevelBadge';
import StatCard from '../../components/StatCard';
import LogActivityModal from '../../components/LogActivityModal';
import AchievementToast from '../../components/AchievementToast';
import { AchievementId } from '../../constants/achievements';

export default function Dashboard() {
  const globalXp = useGameStore(s => s.globalXp);
  const categories = useGameStore(s => s.categories);
  const currentStreak = useGameStore(s => s.currentStreak);
  const longestStreak = useGameStore(s => s.longestStreak);
  const activityLogs = useGameStore(s => s.activityLogs);
  const recentUnlocks = useGameStore(s => s.recentUnlocks);
  const clearRecentUnlocks = useGameStore(s => s.clearRecentUnlocks);
  const weeklyGoals = useGameStore(s => s.weeklyGoals);
  const weekLogs = useCurrentWeekLogs();

  const [logVisible, setLogVisible] = useState(false);
  const [toastAchievement, setToastAchievement] = useState<AchievementId | null>(null);
  const [toastQueue, setToastQueue] = useState<AchievementId[]>([]);

  useEffect(() => {
    if (recentUnlocks.length > 0) {
      setToastQueue(recentUnlocks);
      clearRecentUnlocks();
    }
  }, [recentUnlocks]);

  useEffect(() => {
    if (!toastAchievement && toastQueue.length > 0) {
      const [next, ...rest] = toastQueue;
      setToastAchievement(next);
      setToastQueue(rest);
    }
  }, [toastAchievement, toastQueue]);

  const { level, currentXp, neededXp, progress } = levelFromXp(globalXp);
  const totalMinutes = activityLogs.reduce((s, l) => s + l.minutes, 0);
  const weekMinutes = weekLogs.reduce((s, l) => s + l.minutes, 0);

  function formatHours(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#1a0a3a', '#080810']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.appTitle}>⚡ LevelUp</Text>
              <Text style={styles.subtitle}>Keep the grind going</Text>
            </View>
            <LevelBadge level={level} size="lg" color={Colors.primary} />
          </View>

          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpTitle}>Global XP</Text>
              <Text style={styles.totalXp}>{globalXp.toLocaleString()} XP total</Text>
            </View>
            <XPBar progress={progress} currentXp={currentXp} neededXp={neededXp} color={Colors.xp} height={14} />
            <Text style={styles.levelTitle}>{levelTitle(level)} · Level {level}</Text>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="Streak" value={`${currentStreak}🔥`} icon="📆" color={Colors.accent} />
          <StatCard label="Best Streak" value={`${longestStreak}d`} icon="🏅" color={Colors.gold} />
          <StatCard label="This Week" value={formatHours(weekMinutes)} icon="📊" color={Colors.secondary} />
          <StatCard label="Total Time" value={formatHours(totalMinutes)} icon="⏱️" color={Colors.success} />
        </View>

        {/* Log Button */}
        <TouchableOpacity style={styles.logBtn} onPress={() => setLogVisible(true)}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.logBtnGrad}>
            <Text style={styles.logBtnText}>+ Log Activity</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories Preview */}
        <Text style={styles.sectionTitle}>Skills</Text>
        {categories.map(cat => {
          const catData = levelFromXp(cat.totalXp);
          const weekMins = weekLogs.filter(l => l.categoryId === cat.id).reduce((s, l) => s + l.minutes, 0);
          return (
            <View key={cat.id} style={styles.catCard}>
              <View style={styles.catHeader}>
                <View style={styles.catLeft}>
                  <View style={[styles.catIconBox, { backgroundColor: cat.color + '22' }]}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catSub}>Lv.{catData.level} · {cat.totalXp} XP total</Text>
                  </View>
                </View>
                <View style={styles.catRight}>
                  <Text style={[styles.catLevel, { color: cat.color }]}>LVL {catData.level}</Text>
                  {weekMins > 0 && <Text style={styles.catWeek}>{formatHours(weekMins)} this week</Text>}
                </View>
              </View>
              <XPBar
                progress={catData.progress}
                currentXp={catData.currentXp}
                neededXp={catData.neededXp}
                color={cat.color}
                height={6}
                showLabel={false}
              />
            </View>
          );
        })}

        {/* Recent Activity */}
        {activityLogs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {activityLogs.slice(0, 5).map(log => {
              const cat = categories.find(c => c.id === log.categoryId);
              const date = new Date(log.timestamp);
              const timeStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
                ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              return (
                <View key={log.id} style={styles.logItem}>
                  <Text style={styles.logIcon}>{cat?.icon ?? '📌'}</Text>
                  <View style={styles.logInfo}>
                    <Text style={styles.logDesc}>{log.description}</Text>
                    <Text style={styles.logMeta}>{cat?.name} · {log.minutes}min · {timeStr}</Text>
                  </View>
                  <Text style={styles.logXp}>+{log.xpEarned} XP</Text>
                </View>
              );
            })}
          </>
        )}

        {activityLogs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>Ready to Level Up?</Text>
            <Text style={styles.emptyText}>Log your first activity to start earning XP and unlocking achievements!</Text>
          </View>
        )}
      </ScrollView>

      <LogActivityModal visible={logVisible} onClose={() => setLogVisible(false)} />
      <AchievementToast
        achievementId={toastAchievement}
        onDone={() => setToastAchievement(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: Spacing.xxl },
  header: { padding: Spacing.lg, paddingTop: Platform.OS === 'android' ? 40 : Spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  appTitle: { color: Colors.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: Colors.textDim, fontSize: 13, marginTop: 2 },
  xpSection: { gap: 6 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  xpTitle: { color: Colors.text, fontWeight: '700', fontSize: 14 },
  totalXp: { color: Colors.gold, fontWeight: '700', fontSize: 13 },
  levelTitle: { color: Colors.textDim, fontSize: 12, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, padding: Spacing.md },
  logBtn: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, borderRadius: Radius.md, overflow: 'hidden' },
  logBtnGrad: { padding: Spacing.md, alignItems: 'center' },
  logBtnText: { color: Colors.white, fontWeight: '800', fontSize: 17 },
  sectionTitle: { color: Colors.text, fontWeight: '800', fontSize: 16, paddingHorizontal: Spacing.md, marginTop: Spacing.sm, marginBottom: Spacing.sm },
  catCard: {
    backgroundColor: Colors.card, marginHorizontal: Spacing.md,
    marginBottom: 10, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catIcon: { fontSize: 20 },
  catName: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  catSub: { color: Colors.textDim, fontSize: 11, marginTop: 1 },
  catRight: { alignItems: 'flex-end' },
  catLevel: { fontWeight: '800', fontSize: 15 },
  catWeek: { color: Colors.textDim, fontSize: 11, marginTop: 1 },
  logItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, marginHorizontal: Spacing.md,
    marginBottom: 8, borderRadius: Radius.md, padding: Spacing.sm + 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  logIcon: { fontSize: 20 },
  logInfo: { flex: 1 },
  logDesc: { color: Colors.text, fontWeight: '600', fontSize: 13 },
  logMeta: { color: Colors.textDim, fontSize: 11, marginTop: 1 },
  logXp: { color: Colors.gold, fontWeight: '800', fontSize: 13 },
  emptyState: { alignItems: 'center', padding: Spacing.xl, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  emptyText: { color: Colors.textDim, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
