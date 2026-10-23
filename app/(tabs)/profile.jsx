import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';

const MenuItem = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, danger && { backgroundColor: 'rgba(239,71,111,0.15)' }]}>
      <Ionicons name={icon} size={20} color={danger ? Colors.error : Colors.accent} />
    </View>
    <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
    {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.guestContainer}>
        <Ionicons name="person-circle-outline" size={100} color={Colors.textMuted} />
        <Text style={styles.guestTitle}>Join LakbayLocal</Text>
        <Text style={styles.guestSubtitle}>Create an account to save places, build itineraries, and share local destinations.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.primaryBtnText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.secondaryBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{user.name?.[0]?.toUpperCase()}</Text>
              </View>
            )}
            <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? Colors.error : Colors.accent }]}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Itineraries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Travel</Text>
          <MenuItem icon="map" label="My Itineraries" onPress={() => router.push('/itinerary/create')} />
          <MenuItem icon="heart" label="Saved Places" onPress={() => router.push('/saved')} />
          <MenuItem icon="wallet" label="Budget Trip Builder" onPress={() => router.push('/budget-builder')} />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Community</Text>
          <MenuItem icon="add-circle" label="Submit a Destination" onPress={() => router.push('/destinations/submit')} />
        </View>

        {user.role === 'admin' && (
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Administration</Text>
            <MenuItem icon="grid" label="Admin Dashboard" onPress={() => router.push('/admin')} />
          </View>
        )}

        <View style={styles.menuSection}>
          <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.dark },
  guestContainer:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: 12 },
  guestTitle:      { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  guestSubtitle:   { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center' },
  primaryBtn:      { backgroundColor: Colors.secondary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: Radius.full, width: '100%', alignItems: 'center', marginTop: 8 },
  primaryBtnText:  { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  secondaryBtn:    { borderWidth: 1.5, borderColor: Colors.darkBorder, paddingHorizontal: 32, paddingVertical: 14, borderRadius: Radius.full, width: '100%', alignItems: 'center' },
  secondaryBtnText:{ color: Colors.textMuted, fontWeight: '600', fontSize: FontSize.md },
  profileHeader:   { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarContainer: { position: 'relative', marginBottom: Spacing.md },
  avatar:          { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder:{ width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial:   { color: Colors.white, fontSize: 36, fontWeight: '800' },
  roleBadge:       { position: 'absolute', bottom: 0, right: -4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  roleText:        { color: Colors.white, fontSize: FontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  userName:        { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  userEmail:       { color: Colors.textMuted, fontSize: FontSize.sm },
  statsRow:        { flexDirection: 'row', backgroundColor: Colors.darkCard, margin: Spacing.md, borderRadius: Radius.lg, ...Shadow.subtle },
  stat:            { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statNumber:      { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  statLabel:       { color: Colors.textMuted, fontSize: FontSize.xs },
  statDivider:     { width: 1, backgroundColor: Colors.darkBorder, marginVertical: Spacing.sm },
  menuSection:     { marginHorizontal: Spacing.md, marginBottom: Spacing.md, backgroundColor: Colors.darkCard, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.subtle },
  menuSectionTitle:{ color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  menuItem:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.darkBorder },
  menuIcon:        { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: 'rgba(46,196,182,0.15)', justifyContent: 'center', alignItems: 'center' },
  menuLabel:       { color: Colors.text, fontSize: FontSize.md, fontWeight: '500' },
});
