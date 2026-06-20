import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, TextInput,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useGameStore, useCurrentWeekLogs } from '../../store/gameStore';
import XPBar from '../../components/XPBar';

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

const TIME_PRESETS = [
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '3h', minutes: 180 },
  { label: '5h', minutes: 300 },
  { label: '8h', minutes: 480 },
  { label: '10h', minutes: 600 },
];

export default function GoalsScreen() {
  const categories = useGameStore(s => s.categories);
  const weeklyGoals = useGameStore(s => s.weeklyGoals);
  const setWeeklyGoal = useGameStore(s => s.setWeeklyGoal);
  const removeWeeklyGoal = useGameStore(s => s.removeWeeklyGoal);
  const weekLogs = useCurrentWeekLogs();

  const [addVisible, setAddVisible] = useState(false);
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id ?? '');
  const [selectedMins, setSelectedMins] = useState(120);
  const [customMins, setCustomMins] = useState('');

  const weekStart = new Date();
  const weekDay = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (weekDay === 0 ? 6 : weekDay - 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString();

  const currentGoals = weeklyGoals.filter(g => g.weekStart === weekStartStr);

  function minutesThisWeek(catId: string) {
    return weekLogs.filter(l => l.categoryId === catId).reduce((s, l) => s + l.minutes, 0);
  }

  function handleSave() {
    const mins = customMins ? parseInt(customMins) : selectedMins;
    if (!selectedCat || !mins || mins <= 0) return;
    setWeeklyGoal(selectedCat, mins);
    setCustomMins('');
    setAddVisible(false);
  }

  function formatTime(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  const totalGoalMins = currentGoals.reduce((s, g) => s + g.targetMinutes, 0);
  const totalDoneMins = currentGoals.reduce((s, g) => s + Math.min(minutesThisWeek(g.categoryId), g.targetMinutes), 0);
  const allDone = currentGoals.length > 0 && totalDoneMins >= totalGoalMins;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>📅 Weekly Goals</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddVisible(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.weekRange}>{getWeekRange()}</Text>

        {/* Overall progress */}
        {currentGoals.length > 0 && (
          <View style={[styles.overallCard, allDone && styles.overallDone]}>
            {allDone ? (
              <>
                <Text style={styles.doneEmoji}>🏆</Text>
                <Text style={styles.doneTitle}>Week Complete!</Text>
                <Text style={styles.doneSub}>You crushed all your goals this week!</Text>
              </>
            ) : (
              <>
                <View style={styles.overallHeader}>
                  <Text style={styles.overallTitle}>Weekly Progress</Text>
                  <Text style={styles.overallPct}>{Math.round((totalDoneMins / totalGoalMins) * 100)}%</Text>
                </View>
                <XPBar
                  progress={totalDoneMins / totalGoalMins}
                  currentXp={totalDoneMins}
                  neededXp={totalGoalMins}
                  color={Colors.success}
                  height={12}
                  showLabel={false}
                />
                <Text style={styles.overallSub}>
                  {formatTime(totalDoneMins)} of {formatTime(totalGoalMins)} done
                </Text>
              </>
            )}
          </View>
        )}

        {currentGoals.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No goals this week</Text>
            <Text style={styles.emptyText}>Set weekly targets for each skill to stay focused and earn bonus XP!</Text>
          </View>
        )}

        {currentGoals.map(goal => {
          const cat = categories.find(c => c.id === goal.categoryId);
          if (!cat) return null;
          const done = minutesThisWeek(cat.id);
          const progress = Math.min(done / goal.targetMinutes, 1);
          const completed = progress >= 1;

          return (
            <View key={goal.id} style={[styles.goalCard, { borderColor: cat.color + '44' }, completed && styles.goalCompleted]}>
              <View style={styles.goalHeader}>
                <View style={styles.goalLeft}>
                  <View style={[styles.goalIcon, { backgroundColor: cat.color + '22' }]}>
                    <Text style={styles.goalIconText}>{cat.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.goalCat}>{cat.name}</Text>
                    <Text style={styles.goalTarget}>Goal: {formatTime(goal.targetMinutes)}</Text>
                  </View>
                </View>
                <View style={styles.goalRight}>
                  {completed ? (
                    <Text style={styles.goalDoneTag}>✅ Done!</Text>
                  ) : (
                    <Text style={[styles.goalPct, { color: cat.color }]}>{Math.round(progress * 100)}%</Text>
                  )}
                  <TouchableOpacity onPress={() => removeWeeklyGoal(goal.id)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <XPBar
                progress={progress}
                currentXp={done}
                neededXp={goal.targetMinutes}
                color={completed ? Colors.success : cat.color}
                height={8}
                showLabel={false}
              />
              <Text style={styles.goalProgress}>
                {formatTime(done)} / {formatTime(goal.targetMinutes)}
                {!completed && ` · ${formatTime(goal.targetMinutes - done)} left`}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={addVisible} animationType="slide" transparent onRequestClose={() => setAddVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Set Weekly Goal</Text>

            <Text style={styles.fieldLabel}>Skill</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, selectedCat === cat.id && { backgroundColor: cat.color + '33', borderColor: cat.color }]}
                  onPress={() => setSelectedCat(cat.id)}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={[styles.catName, selectedCat === cat.id && { color: cat.color }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Weekly Target</Text>
            <View style={styles.presetRow}>
              {TIME_PRESETS.map(p => (
                <TouchableOpacity
                  key={p.minutes}
                  style={[styles.preset, selectedMins === p.minutes && !customMins && styles.presetActive]}
                  onPress={() => { setSelectedMins(p.minutes); setCustomMins(''); }}
                >
                  <Text style={[styles.presetText, selectedMins === p.minutes && !customMins && styles.presetTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Custom (minutes)..."
              placeholderTextColor={Colors.textMuted}
              value={customMins}
              onChangeText={setCustomMins}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Set Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  pageTitle: { color: Colors.text, fontSize: 24, fontWeight: '900' },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 16 },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  weekRange: { color: Colors.textDim, fontSize: 13, marginBottom: Spacing.md },
  overallCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  overallDone: { borderColor: Colors.gold + '66', backgroundColor: Colors.gold + '11' },
  overallHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  overallTitle: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  overallPct: { color: Colors.success, fontWeight: '800', fontSize: 15 },
  overallSub: { color: Colors.textDim, fontSize: 12, marginTop: 6, textAlign: 'center' },
  doneEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  doneTitle: { color: Colors.gold, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  doneSub: { color: Colors.textDim, fontSize: 13, textAlign: 'center', marginTop: 4 },
  empty: { alignItems: 'center', padding: Spacing.xl * 2, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  emptyText: { color: Colors.textDim, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  goalCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, marginBottom: 10,
  },
  goalCompleted: { borderColor: Colors.success + '44' },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  goalLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  goalIconText: { fontSize: 20 },
  goalCat: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  goalTarget: { color: Colors.textDim, fontSize: 11, marginTop: 1 },
  goalRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalPct: { fontSize: 16, fontWeight: '800' },
  goalDoneTag: { color: Colors.success, fontWeight: '700', fontSize: 14 },
  removeBtn: { color: Colors.textMuted, fontSize: 16, padding: 4 },
  goalProgress: { color: Colors.textDim, fontSize: 11, marginTop: 6 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, paddingBottom: 40, borderTopWidth: 1, borderColor: Colors.border },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: Spacing.md },
  fieldLabel: { color: Colors.textDim, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  catRow: { flexDirection: 'row', marginBottom: 16 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, backgroundColor: Colors.card },
  catIcon: { fontSize: 16 },
  catName: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  preset: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  presetActive: { backgroundColor: Colors.primary + '33', borderColor: Colors.primary },
  presetText: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
  presetTextActive: { color: Colors.primary },
  input: { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.text, padding: 12, fontSize: 14, marginBottom: Spacing.md },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.card, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  cancelText: { color: Colors.textDim, fontWeight: '700' },
  saveBtn: { flex: 2, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
