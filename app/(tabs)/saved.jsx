import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize } from '../../constants/Colors';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import DestinationCard from '../../components/DestinationCard';

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.favorites.list()
      .then(res => setFavorites(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const removeFavorite = async (destinationId) => {
    await api.favorites.remove(destinationId);
    setFavorites(prev => prev.filter(f => f.id !== destinationId));
  };

  if (!user) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>Save your favorites</Text>
        <Text style={styles.emptyText}>Sign in to save destinations and access them here.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Places</Text>
        <Text style={styles.count}>{favorites.length} saved</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.secondary} />
      ) : favorites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved places yet</Text>
          <Text style={styles.emptyText}>Tap the ♡ on any destination to save it here.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/')}>
            <Text style={styles.loginBtnText}>Discover Places</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(f) => String(f.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing.sm, paddingHorizontal: Spacing.md }}
          contentContainerStyle={{ paddingTop: Spacing.sm, paddingBottom: Spacing.xxl, gap: Spacing.sm }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <DestinationCard
                destination={item}
                onPress={() => router.push(`/destinations/${item.slug}`)}
                onFavorite={() => removeFavorite(item.id)}
                isFavorited
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.dark },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  title:       { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  count:       { color: Colors.textMuted, fontSize: FontSize.sm },
  empty:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: Spacing.xl },
  emptyTitle:  { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  emptyText:   { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center' },
  loginBtn:    { backgroundColor: Colors.secondary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: Radius.full, marginTop: 8 },
  loginBtnText:{ color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
});
