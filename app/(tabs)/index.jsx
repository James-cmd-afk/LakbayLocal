import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  StyleSheet, ImageBackground, Dimensions, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../constants/Colors';
import { api } from '../../services/api';
import DestinationCard from '../../components/DestinationCard';
import CategoryChip from '../../components/CategoryChip';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [featured, setFeatured]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [nearby, setNearby]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const fetchData = async () => {
    try {
      const [featRes, catRes, nearRes] = await Promise.all([
        api.destinations.list({ featured: 'true', limit: 5 }),
        api.destinations.categories(),
        api.destinations.list({ limit: 12 }),
      ]);
      setFeatured(featRes.data);
      setCategories(catRes.data);
      setNearby(nearRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const filterByCategory = async (catId) => {
    setActiveCategory(catId);
    try {
      const res = await api.destinations.list({ category: catId, limit: 12 });
      setNearby(res.data);
    } catch {}
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={Colors.secondary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Mabuhay! 👋</Text>
            <Text style={styles.headline}>Where to today?</Text>
          </View>
          <TouchableOpacity
            style={styles.budgetBtn}
            onPress={() => router.push('/budget-builder')}
          >
            <Ionicons name="wallet" size={18} color={Colors.white} />
            <Text style={styles.budgetBtnText}>Budget Trip</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ── */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/explore')}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <Text style={styles.searchText}>Search destinations...</Text>
        </TouchableOpacity>

        {/* ── Featured Carousel ── */}
        <Text style={styles.sectionTitle}>✨ Featured</Text>
        <FlatList
          horizontal
          data={featured}
          keyExtractor={(d) => String(d.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => router.push(`/destinations/${item.slug}`)}
            >
              <ImageBackground
                source={{ uri: item.cover_image_url }}
                style={styles.featuredImage}
                imageStyle={{ borderRadius: Radius.lg }}
              >
                <View style={styles.featuredOverlay}>
                  <View style={[styles.categoryBadge, { backgroundColor: item.color_hex || Colors.primary }]}>
                    <Ionicons name={item.category_icon} size={12} color="#fff" />
                    <Text style={styles.categoryBadgeText}>{item.category_name}</Text>
                  </View>
                  <Text style={styles.featuredName}>{item.name}</Text>
                  <View style={styles.featuredMeta}>
                    <Ionicons name="location" size={12} color={Colors.textMuted} />
                    <Text style={styles.featuredCity}>{item.city}, {item.province}</Text>
                    <Ionicons name="star" size={12} color={Colors.warning} style={{ marginLeft: 8 }} />
                    <Text style={styles.featuredRating}>{Number(item.avg_rating).toFixed(1)}</Text>
                  </View>
                  <Text style={styles.featuredFee}>
                    {Number(item.entrance_fee) === 0 ? 'Free Entry' : `₱${item.entrance_fee} entry`}
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}
        />

        {/* ── Categories ── */}
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.md }}>
          <CategoryChip
            label="All"
            color={Colors.primary}
            active={!activeCategory}
            onPress={() => { setActiveCategory(null); fetchData(); }}
          />
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.name}
              color={cat.color_hex}
              icon={cat.icon}
              active={activeCategory === cat.id}
              onPress={() => filterByCategory(cat.id)}
            />
          ))}
        </ScrollView>

        {/* ── All Destinations ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destinations</Text>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardGrid}>
          {nearby.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              onPress={() => router.push(`/destinations/${dest.slug}`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.dark },
  loader:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, paddingTop: Spacing.sm },
  greeting:     { color: Colors.textMuted, fontSize: FontSize.sm },
  headline:     { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  budgetBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.secondary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.full },
  budgetBtnText:{ color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  searchBar:    { flexDirection: 'row', alignItems: 'center', gap: 10, margin: Spacing.md, marginTop: 0, backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.sm + 4, borderWidth: 1, borderColor: Colors.darkBorder },
  searchText:   { color: Colors.textMuted, fontSize: FontSize.md },
  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', paddingHorizontal: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: Spacing.md },
  seeAll:       { color: Colors.secondary, fontSize: FontSize.sm, fontWeight: '600' },
  featuredCard: { width: width * 0.72, marginRight: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.card },
  featuredImage:{ width: '100%', height: 220 },
  featuredOverlay: { flex: 1, justifyContent: 'flex-end', padding: Spacing.md, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: Radius.lg },
  categoryBadge:{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, marginBottom: 6 },
  categoryBadgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  featuredName: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800', marginBottom: 4 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  featuredCity: { color: Colors.textMuted, fontSize: FontSize.xs, marginLeft: 2 },
  featuredRating: { color: Colors.warning, fontSize: FontSize.xs, marginLeft: 2, fontWeight: '700' },
  featuredFee:  { color: Colors.accent, fontSize: FontSize.xs, fontWeight: '600' },
  cardGrid:     { paddingHorizontal: Spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingBottom: Spacing.xxl },
});
