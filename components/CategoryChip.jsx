import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, FontSize } from '../constants/Colors';

export default function CategoryChip({ label, icon, color, active, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active && { backgroundColor: color + '22', borderColor: color },
      ]}
      onPress={onPress}
    >
      {icon && <Ionicons name={icon} size={14} color={active ? color : Colors.textMuted} />}
      <Text style={[styles.label, active && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.darkCard, borderWidth: 1.5, borderColor: Colors.darkBorder, marginRight: 8 },
  label: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
});
