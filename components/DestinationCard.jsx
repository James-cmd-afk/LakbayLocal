import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, Shadow } from '../constants/Colors';

export default function DestinationCard({ destination: d, onPress, onFavorite, isFavorited }) {
  const categoryColor = d.color_hex || Colors.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        {d.cover_image_url ? (
          <ImageBackground source={{ uri: d.cover_image_url }} style={styles.imagePlaceholder} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: `${categoryColor}18` }]}>
            <View style={[styles.imageIconWrap, { backgroundColor: `${categoryColor}20` }]}>
              <Ionicons name={d.category_icon || 'map-outline'} size={26} color={categoryColor} />
            </View>
          </View>
        )}
        {onFavorite && (
          <TouchableOpacity style={styles.favBtn} onPress={onFavorite}>
            <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={16} color={isFavorited ? Colors.error : Colors.white} />
          </TouchableOpacity>
        )}
        <View style={[styles.catDot, { backgroundColor: categoryColor }]}>
          <Ionicons name={d.category_icon || 'map'} size={10} color="#fff" />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{d.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>{[d.city, d.province].filter(Boolean).join(', ') || 'Philippines'}</Text>
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
  card:          { backgroundColor: Colors.darkCard, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: Colors.darkBorder, ...Shadow.subtle },
  imageWrap:     { position: 'relative', height: 128, backgroundColor: '#E7EDE7' },
  imagePlaceholder:{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  imageIconWrap: { width: 48, height: 48, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  favBtn:        { position: 'absolute', top: 9, right: 9, width: 31, height: 31, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.94)', justifyContent: 'center', alignItems: 'center' },
  catDot:        { position: 'absolute', bottom: 8, left: 8, width: 23, height: 23, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info:          { padding: 11, gap: 5 },
  name:          { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 18 },
  locationRow:   { flexDirection: 'row', alignItems: 'center', gap: 2 },
  location:      { color: Colors.textMuted, fontSize: FontSize.xs, flex: 1 },
  bottomRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rating:        { color: Colors.warning, fontSize: FontSize.xs, fontWeight: '700' },
  fee:           { color: Colors.accent, fontSize: FontSize.xs, fontWeight: '700' },
});
