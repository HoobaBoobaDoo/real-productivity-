import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { Category } from '../store/gameStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultCategoryId?: string;
}

const QUICK_TIMES = [15, 30, 45, 60, 90, 120];

export default function LogActivityModal({ visible, onClose, defaultCategoryId }: Props) {
  const categories = useGameStore(s => s.categories);
  const logActivity = useGameStore(s => s.logActivity);

  const [selectedCat, setSelectedCat] = useState<string>(defaultCategoryId || (categories[0]?.id ?? ''));
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState('');

  function handleSubmit() {
    const mins = customMinutes ? parseInt(customMinutes) : minutes;
    if (!selectedCat || !mins || mins <= 0) return;
    logActivity(selectedCat, description || 'Session', mins);
    setDescription('');
    setCustomMinutes('');
    setMinutes(30);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Log Activity</Text>

          <Text style={styles.label}>Category</Text>
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

          <Text style={styles.label}>What did you work on?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Scripted episode 5..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            maxLength={100}
          />

          <Text style={styles.label}>Time Spent</Text>
          <View style={styles.timeRow}>
            {QUICK_TIMES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.timeChip, minutes === t && !customMinutes && styles.timeChipActive]}
                onPress={() => { setMinutes(t); setCustomMinutes(''); }}
              >
                <Text style={[styles.timeText, minutes === t && !customMinutes && styles.timeTextActive]}>
                  {t >= 60 ? `${t / 60}h` : `${t}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Or enter custom minutes..."
            placeholderTextColor={Colors.textMuted}
            value={customMinutes}
            onChangeText={setCustomMinutes}
            keyboardType="numeric"
          />

          <View style={styles.xpPreview}>
            <Text style={styles.xpText}>
              +{(customMinutes ? parseInt(customMinutes) || 0 : minutes) * 2} XP
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Log It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md,
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: Spacing.md },
  label: { color: Colors.textDim, fontSize: 12, fontWeight: '600', marginBottom: 8, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  catRow: { flexDirection: 'row', marginBottom: 4 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: 12,
    marginRight: 8, backgroundColor: Colors.card,
  },
  catIcon: { fontSize: 16 },
  catName: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    color: Colors.text, padding: 12, fontSize: 14,
  },
  timeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  timeChip: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  timeChipActive: { backgroundColor: Colors.primary + '33', borderColor: Colors.primary },
  timeText: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
  timeTextActive: { color: Colors.primary },
  xpPreview: { alignItems: 'center', marginVertical: 12 },
  xpText: { color: Colors.gold, fontSize: 22, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: Radius.md,
    backgroundColor: Colors.card, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  cancelText: { color: Colors.textDim, fontWeight: '700' },
  submitBtn: {
    flex: 2, padding: 14, borderRadius: Radius.md,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  submitText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
