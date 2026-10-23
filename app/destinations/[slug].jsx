import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ImageBackground, Dimensions, ActivityIndicator, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../constants/Colors';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color={Colors.accent} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Ionicons key={i} name={i <= full ? 'star' : 'star-outline'} size={14} color={Colors.warning} />
      ))}
    </View>
  );
};

export default function DestinationDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router   = useRouter();
  const { user } = useAuth();
  const [dest, setDest]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [isFav, setIsFav]         = useState(false);
  const [imgIndex, setImgIndex]   = useState(0);

  useEffect(() => {
    api.destinations.get(slug)
      .then(res => setDest(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleFavorite = async () => {
    if (!user) return router.push('/(auth)/login');
    try {
      if (isFav) await api.favorites.remove(dest.id);
      else await api.favorites.add(dest.id);
      setIsFav(!isFav);
    } catch {}
  };

  const addToItinerary = () => {
    if (!user) return router.push('/(auth)/login');
    router.push({ pathname: '/itinerary/create', params: { prefill: dest.id } });
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark }}>
      <ActivityIndicator size="large" color={Colors.secondary} />
    </View>
  );
  if (!dest) return null;

  const allImages = dest.cover_image_url
    ? [{ image_url: dest.cover_image_url }, ...(dest.images || [])]
    : dest.images || [];
  const displayImages = allImages.length ? allImages : [{ image_url: 'https://via.placeholder.com/800x400' }];

  const totalEstimate = Number(dest.entrance_fee) + Number(dest.avg_food_cost) + Number(dest.avg_transport);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dark }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <View style={{ height: 300 }}>
          <ImageBackground
            source={{ uri: displayImages[imgIndex]?.image_url }}
            style={{ width, height: 300 }}
          >
            <View style={styles.imageOverlay}>
              {/* Back button */}
              <SafeAreaView edges={['top']}>
                <View style={styles.topButtons}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={Colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={toggleFavorite}>
                    <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? Colors.error : Colors.white} />
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
              {/* Image dots */}
              {displayImages.length > 1 && (
                <View style={styles.dots}>
                  {displayImages.map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => setImgIndex(i)}>
                      <View style={[styles.dot, imgIndex === i && styles.dotActive]} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ImageBackground>
        </View>

        <View style={styles.content}>
          {/* Category badge */}
          <View style={[styles.catBadge, { backgroundColor: dest.color_hex + '33', borderColor: dest.color_hex }]}>
            <Ionicons name={dest.category_icon} size={13} color={dest.color_hex} />
            <Text style={[styles.catBadgeText, { color: dest.color_hex }]}>{dest.category_name}</Text>
          </View>

          {/* Name & location */}
          <Text style={styles.destName}>{dest.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={Colors.textMuted} />
            <Text style={styles.locationText}>{dest.city}, {dest.province}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Stars rating={dest.avg_rating} />
            <Text style={styles.ratingText}>{Number(dest.avg_rating).toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({dest.review_count} reviews)</Text>
          </View>

          {/* Cost summary card */}
          <View style={styles.costCard}>
            <Text style={styles.costTitle}>Estimated Expenses</Text>
            <View style={styles.costGrid}>
              <View style={styles.costItem}>
                <Ionicons name="ticket" size={18} color={Colors.warning} />
                <Text style={styles.costLabel}>Entry Fee</Text>
                <Text style={styles.costValue}>₱{Number(dest.entrance_fee).toLocaleString()}</Text>
              </View>
              <View style={styles.costItem}>
                <Ionicons name="restaurant" size={18} color={Colors.secondary} />
                <Text style={styles.costLabel}>Food</Text>
                <Text style={styles.costValue}>₱{Number(dest.avg_food_cost).toLocaleString()}</Text>
              </View>
              <View style={styles.costItem}>
                <Ionicons name="bus" size={18} color={Colors.accent} />
                <Text style={styles.costLabel}>Transport</Text>
                <Text style={styles.costValue}>₱{Number(dest.avg_transport).toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.costTotal}>
              <Text style={styles.costTotalLabel}>Total Estimate</Text>
              <Text style={styles.costTotalValue}>₱{totalEstimate.toLocaleString()}</Text>
            </View>
          </View>

          {/* Info rows */}
          <View style={styles.infoCard}>
            <InfoRow icon="time" label="Opens" value={dest.opening_time ? `${dest.opening_time} – ${dest.closing_time}` : 'Not specified'} />
            {dest.submitted_by_name && <InfoRow icon="person" label="Submitted by" value={dest.submitted_by_name} />}
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{dest.description || 'No description available.'}</Text>

          {/* Reviews */}
          {dest.reviews?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Visitor Reviews</Text>
              {dest.reviews.slice(0, 5).map(r => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>{r.reviewer_name?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName}>{r.reviewer_name}</Text>
                      <Stars rating={r.rating} />
                    </View>
                  </View>
                  {r.title && <Text style={styles.reviewTitle}>{r.title}</Text>}
                  <Text style={styles.reviewBody}>{r.body}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={toggleFavorite}>
          <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? Colors.error : Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={addToItinerary}>
          <Ionicons name="map" size={18} color={Colors.white} />
          <Text style={styles.primaryBtnText}>Add to Itinerary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageOverlay:  { flex: 1, justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.25)' },
  topButtons:    { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md },
  iconBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  dots:          { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: Spacing.md },
  dot:           { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive:     { width: 18, backgroundColor: Colors.white },
  content:       { padding: Spacing.md },
  catBadge:      { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, marginBottom: 10 },
  catBadgeText:  { fontSize: FontSize.xs, fontWeight: '700' },
  destName:      { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800', marginBottom: 6 },
  locationRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  locationText:  { color: Colors.textMuted, fontSize: FontSize.sm },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  ratingText:    { color: Colors.warning, fontWeight: '700', fontSize: FontSize.sm },
  reviewCount:   { color: Colors.textMuted, fontSize: FontSize.xs },
  costCard:      { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.darkBorder, ...Shadow.subtle },
  costTitle:     { color: Colors.text, fontWeight: '700', fontSize: FontSize.md, marginBottom: Spacing.sm },
  costGrid:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  costItem:      { alignItems: 'center', gap: 4 },
  costLabel:     { color: Colors.textMuted, fontSize: FontSize.xs },
  costValue:     { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },
  costTotal:     { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.darkBorder },
  costTotalLabel:{ color: Colors.textMuted, fontWeight: '600' },
  costTotalValue:{ color: Colors.secondary, fontWeight: '800', fontSize: FontSize.lg },
  infoCard:      { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, gap: 8, borderWidth: 1, borderColor: Colors.darkBorder },
  infoRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel:     { color: Colors.textMuted, fontSize: FontSize.sm, width: 90 },
  infoValue:     { color: Colors.text, fontSize: FontSize.sm, flex: 1 },
  sectionTitle:  { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.sm, marginTop: Spacing.sm },
  description:   { color: Colors.textMuted, fontSize: FontSize.md, lineHeight: 24, marginBottom: Spacing.lg },
  reviewCard:    { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.darkBorder },
  reviewHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar:  { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  reviewAvatarText: { color: Colors.white, fontWeight: '700' },
  reviewerName:  { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm, marginBottom: 2 },
  reviewTitle:   { color: Colors.text, fontWeight: '700', marginBottom: 4 },
  reviewBody:    { color: Colors.textMuted, fontSize: FontSize.sm, lineHeight: 20 },
  bottomBar:     { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, backgroundColor: Colors.darkCard, borderTopWidth: 1, borderTopColor: Colors.darkBorder },
  secondaryBtn:  { width: 52, height: 52, borderRadius: Radius.md, backgroundColor: Colors.dark, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.darkBorder },
  primaryBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.secondary, borderRadius: Radius.md, height: 52 },
  primaryBtnText:{ color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
});
