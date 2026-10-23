import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, Shadow } from '../constants/Colors';

const { width } = Dimensions.get('window');
const CARD_W = (width - 16 * 2 - 10) / 2;

export default function DestinationCard({ destination: d, onPress, onFavorite, isFavorited }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Thumbnail */}
      <View style={styles.imageWrap}>
        {d.cover_image_url ? (
          <View style={styles.imageContainer}>
            <View
              style={[styles.imagePlaceholder, { backgroundColor: d.color_hex + '44' }]}
            />
            <Text style={styles.imageEmoji}>🏔</Text>
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: (d.color_hex || '#555') + '44' }]}>
            <Ionicons name={d.category_icon || 'map'} size={32} color={d.color_hex || Colors.textMuted} />
          </View>
        )}
        {onFavorite && (
          <TouchableOpacity style={styles.favBtn} onPress={onFavorite}>
            <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={16} color={isFavorited ? Colors.error : Colors.white} />
          </TouchableOpacity>
        )}
        <View style={[styles.catDot, { backgroundColor: d.color_hex || Colors.primary }]}>
          <Ionicons name={d.category_icon || 'map'} size={10} color="#fff" />
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{d.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>{d.city}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={Colors.warning} />
            <Text style={styles.rating}>{Number(d.avg_rating).toFixed(1)}</Text>
          </View>
          <Text style={styles.fee}>
            {Number(d.entrance_fee) === 0 ? 'Free' : `₱${Number(d.entrance_fee).toLocaleString()}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:          { backgroundColor: Colors.darkCard, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.darkBorder, ...Shadow.subtle },
  imageWrap:     { position: 'relative', height: 110 },
  imageContainer:{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  imagePlaceholder:{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  imageEmoji:    { fontSize: 32, position: 'absolute' },
  favBtn:        { position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  catDot:        { position: 'absolute', bottom: 6, left: 6, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  info:          { padding: 10, gap: 4 },
  name:          { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 18 },
  locationRow:   { flexDirection: 'row', alignItems: 'center', gap: 2 },
  location:      { color: Colors.textMuted, fontSize: FontSize.xs, flex: 1 },
  bottomRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rating:        { color: Colors.warning, fontSize: FontSize.xs, fontWeight: '700' },
  fee:           { color: Colors.accent, fontSize: FontSize.xs, fontWeight: '700' },
});
