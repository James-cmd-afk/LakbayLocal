import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('All fields required');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="compass" size={40} color={Colors.white} />
            </View>
            <Text style={styles.logoText}>LakbayLocal</Text>
            <Text style={styles.tagline}>Discover the Philippines</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Welcome back!</Text>
            <Text style={styles.formSubtitle}>Sign in to continue your journey</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Your password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.white} /> : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.registerBtnText}>Create an Account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/')}>
              <Text style={styles.skipBtnText}>Browse without signing in →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.dark },
  content:      { padding: Spacing.xl, paddingTop: Spacing.xxl },
  logoContainer:{ alignItems: 'center', marginBottom: Spacing.xl },
  logo:         { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText:     { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  tagline:      { color: Colors.textMuted, fontSize: FontSize.sm },
  form:         { backgroundColor: Colors.darkCard, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.darkBorder },
  formTitle:    { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginBottom: 4 },
  formSubtitle: { color: Colors.textMuted, fontSize: FontSize.sm, marginBottom: Spacing.lg },
  field:        { gap: 6, marginBottom: Spacing.md },
  label:        { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
  inputWrap:    { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.dark, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, borderWidth: 1, borderColor: Colors.darkBorder },
  input:        { flex: 1, color: Colors.text, fontSize: FontSize.md, paddingVertical: 14 },
  loginBtn:     { backgroundColor: Colors.secondary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  loginBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  divider:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: Spacing.md },
  dividerLine:  { flex: 1, height: 1, backgroundColor: Colors.darkBorder },
  dividerText:  { color: Colors.textMuted, fontSize: FontSize.sm },
  registerBtn:  { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  registerBtnText:{ color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
  skipBtn:      { alignItems: 'center', paddingTop: Spacing.md },
  skipBtnText:  { color: Colors.textMuted, fontSize: FontSize.sm },
});
