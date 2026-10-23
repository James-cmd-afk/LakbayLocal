import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, FlatList, ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../constants/Colors';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import CategoryChip from '../components/CategoryChip';

const CATEGORIES_STATIC = [
  { id: 1, name: 'Beach', icon: 'water', color_hex: '#0EA5E9' },
  { id: 2, name: 'Waterfall', icon: 'water-outline', color_hex: '#06B6D4' },
  { id: 3, name: 'Mountain', icon: 'triangle', color_hex: '#84CC16' },
  { id: 4, name: 'Historical', icon: 'business', color_hex: '#F59E0B' },
  { id: 5, name: 'Restaurant', icon: 'restaurant', color_hex: '#EF4444' },
  { id: 6, name: 'Park & Nature', icon: 'leaf', color_hex: '#22C55E' },
];

export default function BudgetBuilderScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep]               = useState(1);
  const [budget, setBudget]           = useState('');
  const [numDays, setNumDays]         = useState('1');
  const [maxPerDay, setMaxPerDay]     = useState('3');
  const [selCats, setSelCats]         = useState([]);
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);

  const toggleCat = (id) =>
    setSelCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const build = async () => {
    if (!budget || Number(budget) <= 0) return Alert.alert('Enter a valid budget');
    if (!user) return router.push('/(auth)/login');
    setLoading(true);
    try {
      const res = await api.destinations.budgetBuilder({
        budget: Number(budget),
        num_days: Number(numDays) || 1,
        max_per_day: Number(maxPerDay) || 3,
        category_ids: selCats,
      });
      setResult(res);
      setStep(3);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAsItinerary = async () => {
    try {
      const res = await api.itineraries.create({
        title: `₱${budget} – ${numDays}-Day Trip`,
        budget: Number(budget),
        num_days: Number(numDays),
      });
      const itinId = res.id;
      // Add each destination as an item
      for (const day of result.itinerary) {
        for (let i = 0; i < day.destinations.length; i++) {
          const d = day.destinations[i];
          await api.itineraries.addItem(itinId, {
            destination_id: d.id,
            day_number: day.day,
            visit_order: i + 1,
            transport_cost: d.avg_transport,
            meal_cost: d.avg_food_cost,
          });
        }
      }
      Alert.alert('Saved!', 'Your itinerary has been created.', [
        { text: 'View Itinerary', onPress: () => router.push(`/itinerary/${itinId}`) },
        { text: 'OK' },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Budget Trip Builder</Text>
          <Text style={styles.subtitle}>Step {step} of 3</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Step 1: Budget & days */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Ionicons name="wallet" size={48} color={Colors.secondary} style={styles.stepIcon} />
            <Text style={styles.stepTitle}>What's your budget?</Text>
            <Text style={styles.stepDesc}>We'll find the best destinations that fit your budget.</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Total Budget (₱)</Text>
              <TextInput
                style={styles.bigInput}
                placeholder="e.g. 2000"
                placeholderTextColor={Colors.textMuted}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Days</Text>
                <TextInput style={styles.input} placeholder="1" placeholderTextColor={Colors.textMuted}
                  value={numDays} onChangeText={setNumDays} keyboardType="numeric" />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Max stops/day</Text>
                <TextInput style={styles.input} placeholder="3" placeholderTextColor={Colors.textMuted}
                  value={maxPerDay} onChangeText={setMaxPerDay} keyboardType="numeric" />
              </View>
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={() => budget ? setStep(2) : Alert.alert('Enter budget')}>
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Categories */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Ionicons name="options" size={48} color={Colors.accent} style={styles.stepIcon} />
            <Text style={styles.stepTitle}>What do you enjoy?</Text>
            <Text style={styles.stepDesc}>Pick categories you're interested in (optional).</Text>
            <View style={styles.catGrid}>
              {CATEGORIES_STATIC.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCard, selCats.includes(cat.id) && { borderColor: cat.color_hex, backgroundColor: cat.color_hex + '22' }]}
                  onPress={() => toggleCat(cat.id)}
                >
                  <Ionicons name={cat.icon} size={28} color={selCats.includes(cat.id) ? cat.color_hex : Colors.textMuted} />
                  <Text style={[styles.catCardText, selCats.includes(cat.id) && { color: cat.color_hex }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={build} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.nextBtnText}>Build My Trip ✨</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <View>
            {/* Budget summary */}
            <View style={styles.budgetSummary}>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Your Budget</Text>
                <Text style={styles.budgetValue}>₱{Number(result.budget).toLocaleString()}</Text>
              </View>
              <View style={styles.budgetDivider} />
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Estimated Cost</Text>
                <Text style={[styles.budgetValue, { color: Colors.secondary }]}>₱{Number(result.estimated_total).toLocaleString()}</Text>
              </View>
              <View style={styles.budgetDivider} />
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Remaining</Text>
                <Text style={[styles.budgetValue, { color: result.remaining >= 0 ? Colors.success : Colors.error }]}>
                  ₱{Number(result.remaining).toLocaleString()}
                </Text>
              </View>
            </View>

            {result.itinerary.map(day => (
              <View key={day.day} style={styles.dayBlock}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>Day {day.day}</Text>
                  <Text style={styles.dayTotal}>₱{Number(day.day_total).toLocaleString()}</Text>
                </View>
                {day.destinations.map((d, i) => (
                  <TouchableOpacity
                    key={d.id}
                    style={styles.destItem}
                    onPress={() => router.push(`/destinations/${d.slug}`)}
                  >
                    <View style={styles.destOrder}>
                      <Text style={styles.destOrderText}>{i + 1}</Text>
                    </View>
                    <ImageBackground
                      source={{ uri: d.cover_image_url }}
                      style={styles.destThumb}
                      imageStyle={{ borderRadius: Radius.sm }}
                    />
                    <View style={styles.destInfo}>
                      <Text style={styles.destName}>{d.name}</Text>
                      <Text style={styles.destCity}>{d.city}</Text>
                      <View style={styles.destCostRow}>
                        <Ionicons name="wallet-outline" size={12} color={Colors.accent} />
                        <Text style={styles.destCost}>₱{Number(d.estimated_cost).toLocaleString()}</Text>
                        <Ionicons name="star" size={12} color={Colors.warning} style={{ marginLeft: 8 }} />
                        <Text style={styles.destRating}>{Number(d.avg_rating).toFixed(1)}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <TouchableOpacity style={styles.saveBtn} onPress={saveAsItinerary}>
              <Ionicons name="save" size={20} color={Colors.white} />
              <Text style={styles.saveBtnText}>Save as Itinerary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rebuildBtn} onPress={() => setStep(1)}>
              <Text style={styles.rebuildBtnText}>Rebuild with different settings</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.dark },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  backBtn:      { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title:        { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800', textAlign: 'center' },
  subtitle:     { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center' },
  progressBar:  { height: 4, backgroundColor: Colors.darkCard, marginHorizontal: Spacing.md, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: Colors.secondary, borderRadius: 2 },
  body:         { padding: Spacing.md, paddingBottom: Spacing.xxl },
  stepContent:  { alignItems: 'stretch' },
  stepIcon:     { alignSelf: 'center', marginVertical: Spacing.lg },
  stepTitle:    { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  stepDesc:     { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', marginBottom: Spacing.xl },
  field:        { gap: 6, marginBottom: Spacing.sm },
  label:        { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
  bigInput:     { backgroundColor: Colors.darkCard, borderWidth: 1.5, borderColor: Colors.secondary, borderRadius: Radius.md, padding: Spacing.md, color: Colors.secondary, fontSize: FontSize.xxl, fontWeight: '800', textAlign: 'center' },
  input:        { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder, borderRadius: Radius.md, padding: Spacing.sm + 4, color: Colors.text, fontSize: FontSize.md },
  row:          { flexDirection: 'row', gap: Spacing.sm },
  nextBtn:      { backgroundColor: Colors.secondary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.lg },
  nextBtnText:  { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  catGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  catCard:      { width: '30%', aspectRatio: 1, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.darkBorder, backgroundColor: Colors.darkCard, justifyContent: 'center', alignItems: 'center', gap: 8 },
  catCardText:  { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600', textAlign: 'center' },
  budgetSummary:{ flexDirection: 'row', backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.darkBorder },
  budgetItem:   { flex: 1, alignItems: 'center' },
  budgetLabel:  { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: 4 },
  budgetValue:  { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  budgetDivider:{ width: 1, backgroundColor: Colors.darkBorder, marginVertical: 4 },
  dayBlock:     { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, marginBottom: Spacing.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.darkBorder },
  dayHeader:    { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.primary + '44' },
  dayTitle:     { color: Colors.text, fontWeight: '800', fontSize: FontSize.md },
  dayTotal:     { color: Colors.accent, fontWeight: '700' },
  destItem:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.darkBorder },
  destOrder:    { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center' },
  destOrderText:{ color: Colors.white, fontWeight: '800', fontSize: FontSize.xs },
  destThumb:    { width: 56, height: 56, borderRadius: Radius.sm, backgroundColor: Colors.darkBorder },
  destInfo:     { flex: 1, gap: 2 },
  destName:     { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },
  destCity:     { color: Colors.textMuted, fontSize: FontSize.xs },
  destCostRow:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  destCost:     { color: Colors.accent, fontSize: FontSize.xs, fontWeight: '700' },
  destRating:   { color: Colors.warning, fontSize: FontSize.xs, fontWeight: '700' },
  saveBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.secondary, borderRadius: Radius.md, paddingVertical: 16, marginTop: Spacing.md },
  saveBtnText:  { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  rebuildBtn:   { alignItems: 'center', padding: Spacing.md },
  rebuildBtnText:{ color: Colors.textMuted, fontSize: FontSize.sm },
});
