import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize } from '../../constants/Colors';
import { api } from '../../services/api';
import DestinationCard from '../../components/DestinationCard';

const SORT_OPTIONS = ['Highest Rated', 'Free Entry', 'Most Reviewed'];

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [activeSort, setActiveSort] = useState(0);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);

  const search = useCallback(async (q = query, pg = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.destinations.list({ search: q.trim(), page: pg, limit: 10 });
      if (pg === 1) setResults(res.data);
      else setResults(prev => [...prev, ...res.data]);
      setHasMore(pg < res.pagination.pages);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  }, [query]);

  const loadMore = () => { if (hasMore && !loading) search(query, page + 1); };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search input */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search beaches, falls, landmarks…"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => search(query, 1)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => search(query, 1)}>
          <Text style={styles.searchBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* Sort chips */}
      {searched && (
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((s, i) => (
            <TouchableOpacity
              key={s}
              style={[styles.sortChip, activeSort === i && styles.sortChipActive]}
              onPress={() => setActiveSort(i)}
            >
              <Text style={[styles.sortText, activeSort === i && styles.sortTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results */}
      {loading && page === 1 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.secondary} />
      ) : searched && results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No destinations found</Text>
          <Text style={styles.emptySubText}>Try a different keyword</Text>
        </View>
      ) : !searched ? (
        <View style={styles.empty}>
          <Ionicons name="compass-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Find your next adventure</Text>
          <Text style={styles.emptySubText}>Search by name, city, or province</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(d) => String(d.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing.sm, paddingHorizontal: Spacing.md }}
          contentContainerStyle={{ paddingTop: Spacing.sm, paddingBottom: Spacing.xxl, gap: Spacing.sm }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <DestinationCard
                destination={item}
                onPress={() => router.push(`/destinations/${item.slug}`)}
              />
            </View>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loading ? <ActivityIndicator color={Colors.secondary} style={{ margin: Spacing.md }} /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.dark },
  searchRow:   { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md },
  searchBox:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.darkCard, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, borderWidth: 1, borderColor: Colors.darkBorder },
  input:       { flex: 1, color: Colors.text, fontSize: FontSize.md, paddingVertical: 12 },
  searchBtn:   { backgroundColor: Colors.secondary, paddingHorizontal: 18, borderRadius: Radius.md, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
  sortRow:     { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sortChip:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder },
  sortChipActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  sortText:    { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600' },
  sortTextActive: { color: Colors.white },
  empty:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText:   { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  emptySubText:{ color: Colors.textMuted, fontSize: FontSize.sm },
});
