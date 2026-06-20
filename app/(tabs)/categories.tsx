import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, TextInput, Platform, Alert,
} from 'react-native';
import { Colors, Spacing, Radius, CATEGORY_COLORS } from '../../constants/theme';
import { useGameStore } from '../../store/gameStore';
import { levelFromXp, categoryLevelTitle } from '../../utils/xp';
import XPBar from '../../components/XPBar';
import LogActivityModal from '../../components/LogActivityModal';
import AchievementToast from '../../components/AchievementToast';
import { AchievementId } from '../../constants/achievements';

const CATEGORY_ICONS = ['🎬', '🎮', '🎵', '📚', '💪', '🎨', '✍️', '🧠', '💻', '🎯', '🏃', '🍳', '📷', '🎸', '🔬'];

export default function CategoriesScreen() {
  const categories = useGameStore(s => s.categories);
  const activityLogs = useGameStore(s => s.activityLogs);
  const addCategory = useGameStore(s => s.addCategory);
  const removeCategory = useGameStore(s => s.removeCategory);
  const recentUnlocks = useGameStore(s => s.recentUnlocks);
  const clearRecentUnlocks = useGameStore(s => s.clearRecentUnlocks);

  const [addVisible, setAddVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🎯');
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const [logVisible, setLogVisible] = useState(false);
  const [logCatId, setLogCatId] = useState<string | undefined>();
  const [toastAchievement, setToastAchievement] = useState<AchievementId | null>(null);

  React.useEffect(() => {
    if (recentUnlocks.length > 0) {
      setToastAchievement(recentUnlocks[0]);
      clearRecentUnlocks();
    }
  }, [recentUnlocks]);

  function handleAdd() {
    if (!newName.trim()) return;
    addCategory(newName.trim(), newIcon, newColor);
    setNewName('');
    setNewIcon('🎯');
    setNewColor(CATEGORY_COLORS[0]);
    setAddVisible(false);
  }

  function handleDelete(id: string, name: string) {
    Alert.alert('Delete Skill', `Remove "${name}"? Your logs will still be saved.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeCategory(id) },
    ]);
  }

  function formatHours(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>🎯 Skills</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddVisible(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Each skill has its own level. Keep grinding to rank up!</Text>

        {categories.map(cat => {
          const { level, currentXp, neededXp, progress } = levelFromXp(cat.totalXp);
          const totalMins = activityLogs.filter(l => l.categoryId === cat.id).reduce((s, l) => s + l.minutes, 0);
          const logCount = activityLogs.filter(l => l.categoryId === cat.id).length;

          return (
            <View key={cat.id} style={[styles.card, { borderColor: cat.color + '44' }]}>
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: cat.color + '22' }]}>
                  <Text style={styles.cardIcon}>{cat.icon}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{cat.name}</Text>
                  <Text style={[styles.cardTitle, { color: cat.color }]}>{categoryLevelTitle(level)}</Text>
                </View>
                <View style={[styles.levelBadge, { borderColor: cat.color }]}>
                  <Text style={[styles.levelNum, { color: cat.color }]}>{level}</Text>
                  <Text style={styles.levelLabel}>LVL</Text>
                </View>
              </View>

              <View style={styles.xpRow}>
                <XPBar progress={progress} currentXp={currentXp} neededXp={neededXp} color={cat.color} height={8} />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statVal, { color: cat.color }]}>{cat.totalXp.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>XP Earned</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statVal, { color: cat.color }]}>{formatHours(totalMins)}</Text>
                  <Text style={styles.statLabel}>Total Time</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statVal, { color: cat.color }]}>{logCount}</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.logBtn, { backgroundColor: cat.color }]}
                  onPress={() => { setLogCatId(cat.id); setLogVisible(true); }}
                >
                  <Text style={styles.logBtnText}>+ Log Session</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(cat.id, cat.name)}>
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {categories.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>Add your first skill to start tracking progress!</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Category Modal */}
      <Modal visible={addVisible} animationType="slide" transparent onRequestClose={() => setAddVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>New Skill</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. YouTube, Game Dev, Music..."
              placeholderTextColor={Colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.fieldLabel}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconRow}>
              {CATEGORY_ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconChip, newIcon === icon && styles.iconChipActive]}
                  onPress={() => setNewIcon(icon)}
                >
                  <Text style={styles.iconOption}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {CATEGORY_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorDot, { backgroundColor: color }, newColor === color && styles.colorDotActive]}
                  onPress={() => setNewColor(color)}
                />
              ))}
            </View>

            {/* Preview */}
            <View style={[styles.preview, { borderColor: newColor + '44' }]}>
              <View style={[styles.previewIcon, { backgroundColor: newColor + '22' }]}>
                <Text style={styles.previewIconText}>{newIcon}</Text>
              </View>
              <Text style={[styles.previewName, { color: newColor }]}>{newName || 'Skill Name'}</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.createBtn, { backgroundColor: newColor }]} onPress={handleAdd}>
                <Text style={styles.createText}>Create Skill</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <LogActivityModal visible={logVisible} onClose={() => setLogVisible(false)} defaultCategoryId={logCatId} />
      <AchievementToast achievementId={toastAchievement} onDone={() => setToastAchievement(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pageTitle: { color: Colors.text, fontSize: 24, fontWeight: '900' },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 16 },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  subtitle: { color: Colors.textDim, fontSize: 13, marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, padding: Spacing.md, marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardIcon: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardName: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  cardTitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  levelBadge: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface,
  },
  levelNum: { fontSize: 18, fontWeight: '900', lineHeight: 20 },
  levelLabel: { color: Colors.textMuted, fontSize: 9, fontWeight: '700' },
  xpRow: { marginBottom: 12 },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '800' },
  statLabel: { color: Colors.textDim, fontSize: 10, marginTop: 1 },
  cardActions: { flexDirection: 'row', gap: 8 },
  logBtn: { flex: 1, padding: 10, borderRadius: Radius.md, alignItems: 'center' },
  logBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  deleteBtn: { padding: 10, borderRadius: Radius.md, backgroundColor: Colors.cardAlt, borderWidth: 1, borderColor: Colors.border },
  deleteBtnText: { fontSize: 18 },
  empty: { alignItems: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: Colors.textDim, fontSize: 14, textAlign: 'center' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, paddingBottom: 40, borderTopWidth: 1, borderColor: Colors.border },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: Spacing.md },
  fieldLabel: { color: Colors.textDim, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.text, padding: 12, fontSize: 14, marginBottom: Spacing.md },
  iconRow: { flexDirection: 'row', marginBottom: Spacing.md },
  iconChip: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  iconChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  iconOption: { fontSize: 22 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: Colors.white },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, padding: 12, borderWidth: 1, marginBottom: Spacing.md },
  previewIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  previewIconText: { fontSize: 24 },
  previewName: { fontSize: 18, fontWeight: '800' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.card, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  cancelText: { color: Colors.textDim, fontWeight: '700' },
  createBtn: { flex: 2, padding: 14, borderRadius: Radius.md, alignItems: 'center' },
  createText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
