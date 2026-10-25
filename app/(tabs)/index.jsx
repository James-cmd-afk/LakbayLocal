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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Ionicons name="navigate" size={18} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.brandName}>lakbaylocal</Text>
              <Text style={styles.brandCaption}>YOUR LOCAL TRAVEL GUIDE</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/profile')}>
            <Ionicons name="person-outline" size={19} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>MABUHAY, EXPLORER</Text>
          <Text style={styles.headline}>Find your{'\n'}kind of <Text style={styles.headlineAccent}>escape.</Text></Text>
          <Text style={styles.introCopy}>Little-known places. Big stories. All close to home.</Text>
        </View>

        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/explore')} activeOpacity={0.85}>
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.searchText}>Where do you want to go?</Text>
          <Ionicons name="options-outline" size={19} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>CURATED FOR YOU</Text>
            <Text style={styles.sectionTitle}>Worth the trip</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={styles.seeAll}>View all <Ionicons name="arrow-forward" size={13} color={Colors.primary} /></Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={featured}
          keyExtractor={(d) => String(d.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
          ListEmptyComponent={
            <View style={styles.featuredEmpty}>
              <Ionicons name="sunny-outline" size={24} color={Colors.primary} />
              <Text style={styles.featuredEmptyText}>New local finds are on their way.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => router.push(`/destinations/${item.slug}`)}
              activeOpacity={0.9}
            >
              <ImageBackground
                source={item.cover_image_url ? { uri: item.cover_image_url } : undefined}
                style={styles.featuredImage}
                imageStyle={styles.featuredImageStyle}
              >
                <View style={styles.featuredOverlay}>
                  <View style={styles.featuredTopRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: item.color_hex || Colors.primary }]}>
                      <Ionicons name={item.category_icon || 'compass-outline'} size={12} color="#fff" />
                      <Text style={styles.categoryBadgeText}>{item.category_name || 'Local favorite'}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#E8A83E" />
                      <Text style={styles.featuredRating}>{Number(item.avg_rating || 0).toFixed(1)}</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.featuredName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.featuredMeta}>
                      <Ionicons name="location-outline" size={13} color="#F7F5EF" />
                      <Text style={styles.featuredCity} numberOfLines={1}>{[item.city, item.province].filter(Boolean).join(', ')}</Text>
                    </View>
                  </View>
                  <View style={styles.featuredMeta}>
                    <Ionicons name="ticket-outline" size={13} color="#E6C6A2" />
                    <Text style={styles.featuredFee}>
                      {Number(item.entrance_fee) === 0 ? 'Free entry' : `₱${Number(item.entrance_fee).toLocaleString()} entry`}
                    </Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}
        />

        <View style={[styles.sectionHeader, styles.categoryHeader]}>
          <View>
            <Text style={styles.sectionEyebrow}>PICK YOUR PACE</Text>
            <Text style={styles.sectionTitle}>Explore by mood</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
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
              color={cat.color_hex || Colors.primary}
              icon={cat.icon}
              active={activeCategory === cat.id}
              onPress={() => filterByCategory(cat.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>CLOSE TO HOME</Text>
            <Text style={styles.sectionTitle}>Local discoveries</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={styles.seeAll}>See all <Ionicons name="arrow-forward" size={13} color={Colors.primary} /></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardGrid}>
          {nearby.length === 0 && (
            <View style={styles.noResults}>
              <Ionicons name="map-outline" size={24} color={Colors.textMuted} />
              <Text style={styles.noResultsText}>No places in this category yet.</Text>
            </View>
          )}
          {nearby.map((dest) => (
            <View key={dest.id} style={styles.destinationCell}>
              <DestinationCard
                destination={dest}
                onPress={() => router.push(`/destinations/${dest.slug}`)}
              />
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.budgetBanner} onPress={() => router.push('/budget-builder')} activeOpacity={0.9}>
          <View style={styles.budgetIcon}>
            <Ionicons name="wallet-outline" size={21} color="#EFD8B8" />
          </View>
          <View style={styles.budgetCopy}>
            <Text style={styles.budgetEyebrow}>TRAVEL MORE, SPEND SMART</Text>
            <Text style={styles.budgetTitle}>Plan a trip for your budget</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={27} color="#EFD8B8" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 38, height: 38, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: Colors.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.4 },
  brandCaption: { color: Colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1.15, marginTop: 2 },
  avatarButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder },
  intro: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  eyebrow: { color: Colors.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  headline: { color: Colors.text, fontSize: 37, fontWeight: '800', letterSpacing: -1.5, lineHeight: 41 },
  headlineAccent: { color: Colors.primary },
  introCopy: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 11, marginHorizontal: Spacing.md, marginTop: Spacing.sm, marginBottom: Spacing.lg, backgroundColor: Colors.darkCard, borderRadius: 17, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1, borderColor: Colors.darkBorder },
  searchIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#EEF3EF', alignItems: 'center', justifyContent: 'center' },
  searchText: { color: Colors.textMuted, fontSize: FontSize.sm, flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: Spacing.md, marginBottom: 13 },
  sectionEyebrow: { color: Colors.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1.4, marginBottom: 4 },
  sectionTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.6 },
  seeAll: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700', marginBottom: 3 },
  featuredList: { paddingHorizontal: Spacing.md, paddingBottom: 3 },
  featuredCard: { width: width * 0.78, height: 278, marginRight: 13, borderRadius: 23, overflow: 'hidden', backgroundColor: Colors.primary, ...Shadow.card },
  featuredImage: { width: '100%', height: '100%', backgroundColor: '#718B76' },
  featuredImageStyle: { borderRadius: 23 },
  featuredOverlay: { flex: 1, justifyContent: 'space-between', padding: 15, backgroundColor: 'rgba(22,40,32,0.24)' },
  featuredTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full },
  categoryBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(20,31,27,0.58)', paddingHorizontal: 9, paddingVertical: 6, borderRadius: Radius.full },
  featuredRating: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  featuredName: { color: Colors.white, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  featuredCity: { color: '#F7F5EF', fontSize: FontSize.xs, flexShrink: 1 },
  featuredFee: { color: '#F2E4D3', fontSize: FontSize.xs, fontWeight: '600' },
  featuredEmpty: { width: width - Spacing.md * 2, height: 120, borderRadius: Radius.lg, backgroundColor: '#E9EEE8', alignItems: 'center', justifyContent: 'center', gap: 8 },
  featuredEmptyText: { color: Colors.textMuted, fontSize: FontSize.sm },
  categoryHeader: { marginTop: 27 },
  categoryList: { paddingHorizontal: Spacing.md, paddingBottom: 2 },
  cardGrid: { paddingHorizontal: Spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingBottom: Spacing.md },
  destinationCell: { width: '48%' },
  noResults: { width: '100%', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.xl, backgroundColor: Colors.darkCard, borderRadius: Radius.lg },
  noResultsText: { color: Colors.textMuted, fontSize: FontSize.sm },
  budgetBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: Spacing.md, marginTop: 5, marginBottom: Spacing.xxl, padding: 15, borderRadius: 20, backgroundColor: Colors.primary },
  budgetIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  budgetCopy: { flex: 1 },
  budgetEyebrow: { color: '#D4E3D9', fontSize: 8, fontWeight: '800', letterSpacing: 1.1, marginBottom: 4 },
  budgetTitle: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
});
