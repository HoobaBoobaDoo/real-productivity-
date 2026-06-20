import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useGameStore } from '../../store/gameStore';

function groupByDate(logs: any[]) {
  const groups: { date: string; logs: any[] }[] = [];
  for (const log of logs) {
    const date = new Date(log.timestamp).toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.logs.push(log);
    } else {
      groups.push({ date, logs: [log] });
    }
  }
  return groups;
}

export default function LogScreen() {
  const activityLogs = useGameStore(s => s.activityLogs);
  const categories = useGameStore(s => s.categories);
  const resetAll = useGameStore(s => s.resetAll);

  const totalMinutes = activityLogs.reduce((s, l) => s + l.minutes, 0);
  const totalXp = activityLogs.reduce((s, l) => s + l.xpEarned, 0);

  function formatTime(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  function handleReset() {
    Alert.alert(
      'Reset All Data',
      'This will delete all your progress, levels, XP, and activity logs. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset Everything', style: 'destructive', onPress: resetAll },
      ]
    );
  }

  const grouped = groupByDate(activityLogs);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>📋 Activity Log</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{activityLogs.length}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: Colors.secondary }]}>{formatTime(totalMinutes)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: Colors.gold }]}>{totalXp.toLocaleString()}</Text>
            <Text style={styles.statLabel}>XP from Sessions</Text>
          </View>
        </View>

        {activityLogs.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No activities logged yet</Text>
            <Text style={styles.emptyText}>Your logged sessions will appear here.</Text>
          </View>
        )}

        {grouped.map(group => (
          <View key={group.date}>
            <Text style={styles.dateHeader}>{group.date}</Text>
            {group.logs.map((log: any) => {
              const cat = categories.find(c => c.id === log.categoryId);
              const time = new Date(log.timestamp).toLocaleTimeString(undefined, {
                hour: '2-digit', minute: '2-digit',
              });
              return (
                <View key={log.id} style={[styles.logItem, { borderLeftColor: cat?.color ?? Colors.border }]}>
                  <View style={styles.logMain}>
                    <View style={styles.logTop}>
                      <Text style={styles.logIcon}>{cat?.icon ?? '📌'}</Text>
                      <Text style={styles.logCat}>{cat?.name ?? 'Unknown'}</Text>
                      <Text style={styles.logTime}>{time}</Text>
                    </View>
                    <Text style={styles.logDesc}>{log.description}</Text>
                  </View>
                  <View style={styles.logRight}>
                    <Text style={styles.logMins}>{log.minutes}min</Text>
                    <Text style={styles.logXp}>+{log.xpEarned} XP</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>🗑️ Reset All Progress</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 80 },
  pageTitle: { color: Colors.text, fontSize: 24, fontWeight: '900', marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statVal: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: Colors.textDim, fontSize: 10, marginTop: 2, textAlign: 'center' },
  empty: { alignItems: 'center', padding: Spacing.xxl, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  emptyText: { color: Colors.textDim, fontSize: 14 },
  dateHeader: { color: Colors.textDim, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginVertical: 10 },
  logItem: {
    backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, borderLeftWidth: 3, padding: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  logMain: { flex: 1 },
  logTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  logIcon: { fontSize: 14 },
  logCat: { color: Colors.textDim, fontSize: 12, fontWeight: '600' },
  logTime: { color: Colors.textMuted, fontSize: 11, marginLeft: 'auto' },
  logDesc: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  logRight: { alignItems: 'flex-end', marginLeft: 12 },
  logMins: { color: Colors.secondary, fontWeight: '700', fontSize: 13 },
  logXp: { color: Colors.gold, fontWeight: '800', fontSize: 13, marginTop: 2 },
  dangerZone: { marginTop: Spacing.xl, borderTopWidth: 1, borderColor: Colors.border, paddingTop: Spacing.md },
  dangerTitle: { color: Colors.danger, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  resetBtn: { backgroundColor: Colors.danger + '11', borderWidth: 1, borderColor: Colors.danger + '44', borderRadius: Radius.md, padding: 14, alignItems: 'center' },
  resetText: { color: Colors.danger, fontWeight: '700', fontSize: 14 },
});
