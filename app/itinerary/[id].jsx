import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Spacing } from '../../constants/Colors';
import { api } from '../../services/api';

export default function ItineraryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const itineraryId = Array.isArray(id) ? id[0] : id;
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadItinerary = useCallback(async () => {
    if (!itineraryId) {
      setError('Itinerary not found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.itineraries.get(itineraryId);
      setItinerary(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [itineraryId]);

  useEffect(() => {
    loadItinerary();
  }, [loadItinerary]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Itinerary</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.centered} size="large" color={Colors.secondary} />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadItinerary} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{itinerary.title}</Text>
          {!!itinerary.description && <Text style={styles.description}>{itinerary.description}</Text>}

          <View style={styles.summary}>
            <Text style={styles.summaryText}>₱{Number(itinerary.budget || 0).toLocaleString()} budget</Text>
            <Text style={styles.summaryText}>{itinerary.num_days} days</Text>
            {!!itinerary.start_date && (
              <Text style={styles.summaryText}>
                {String(itinerary.start_date).slice(0, 10)}
                {itinerary.end_date ? ` – ${String(itinerary.end_date).slice(0, 10)}` : ''}
              </Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Planned destinations</Text>
          {itinerary.items?.length ? itinerary.items.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeading}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.dayLabel}>Day {item.day_number}</Text>
              </View>
              <Text style={styles.itemLocation}>
                {[item.city, item.category_name].filter(Boolean).join(' · ')}
              </Text>
              {!!item.notes && <Text style={styles.description}>{item.notes}</Text>}
            </View>
          )) : (
            <Text style={styles.emptyText}>No destinations have been added yet.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  description: { color: Colors.textMuted, fontSize: FontSize.md },
  summary: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  summaryText: { color: Colors.text, fontSize: FontSize.sm },
  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', marginTop: Spacing.sm },
  itemCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  itemHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  itemName: { flex: 1, color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  dayLabel: { color: Colors.secondary, fontSize: FontSize.sm, fontWeight: '600' },
  itemLocation: { color: Colors.textMuted, fontSize: FontSize.sm },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm },
  errorText: { color: Colors.error, fontSize: FontSize.md, textAlign: 'center' },
  retryButton: { backgroundColor: Colors.secondary, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  retryText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
});
