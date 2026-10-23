import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize } from '../../constants/Colors';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function CreateItineraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
    num_days: '1',
  });
  const [saving, setSaving] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleCreate = async () => {
    if (!form.title.trim()) return Alert.alert('Title required');
    if (!user) return router.push('/(auth)/login');
    setSaving(true);
    try {
      const res = await api.itineraries.create({
        ...form,
        budget: Number(form.budget) || 0,
        num_days: Number(form.num_days) || 1,
      });
      router.replace(`/itinerary/${res.id}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>New Itinerary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Trip Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Palawan Adventure Weekend"
            placeholderTextColor={Colors.textMuted}
            value={form.title}
            onChangeText={v => update('title', v)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="What's this trip about?"
            placeholderTextColor={Colors.textMuted}
            value={form.description}
            onChangeText={v => update('description', v)}
            multiline
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted}
              value={form.start_date} onChangeText={v => update('start_date', v)} />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>End Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted}
              value={form.end_date} onChangeText={v => update('end_date', v)} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Budget (₱)</Text>
            <TextInput style={styles.input} placeholder="2000" placeholderTextColor={Colors.textMuted}
              value={form.budget} onChangeText={v => update('budget', v)} keyboardType="numeric" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Number of Days</Text>
            <TextInput style={styles.input} placeholder="1" placeholderTextColor={Colors.textMuted}
              value={form.num_days} onChangeText={v => update('num_days', v)} keyboardType="numeric" />
          </View>
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={saving}>
          {saving ? <ActivityIndicator color={Colors.white} /> : (
            <>
              <Ionicons name="map" size={20} color={Colors.white} />
              <Text style={styles.createBtnText}>Create Itinerary</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Budget Builder shortcut */}
        <TouchableOpacity style={styles.builderBtn} onPress={() => router.push('/budget-builder')}>
          <Ionicons name="sparkles" size={18} color={Colors.secondary} />
          <Text style={styles.builderBtnText}>Use Budget Trip Builder instead</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.dark },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  backBtn:      { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title:        { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  body:         { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  field:        { gap: 6 },
  label:        { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
  input:        { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder, borderRadius: Radius.md, padding: Spacing.sm + 4, color: Colors.text, fontSize: FontSize.md },
  row:          { flexDirection: 'row', gap: Spacing.sm },
  createBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.secondary, borderRadius: Radius.md, paddingVertical: 16, marginTop: Spacing.md },
  createBtnText:{ color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  builderBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: Spacing.md },
  builderBtnText:{ color: Colors.secondary, fontSize: FontSize.sm, fontWeight: '600' },
});
