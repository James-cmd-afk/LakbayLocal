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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password)
      return Alert.alert('All fields required');
    if (password.length < 8)
      return Alert.alert('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(name, email, password);
      router.replace('/');
    } catch (e) {
      Alert.alert('Registration Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="compass" size={40} color={Colors.white} />
            </View>
            <Text style={styles.logoText}>LakbayLocal</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>Start your local adventure today</Text>

            {[
              { label: 'Full Name', icon: 'person-outline', value: name, onChange: setName, placeholder: 'Juan dela Cruz', autoCapitalize: 'words' },
              { label: 'Email', icon: 'mail-outline', value: email, onChange: setEmail, placeholder: 'juan@email.com', keyboardType: 'email-address' },
            ].map(({ label, icon, value, onChange, placeholder, ...rest }) => (
              <View key={label} style={styles.field}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={icon} size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    {...rest}
                  />
                </View>
              </View>
            ))}

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 8 characters"
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

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.white} /> : (
                <Text style={styles.registerBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLinkText}>Already have an account? <Text style={{ color: Colors.secondary }}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.dark },
  content:        { padding: Spacing.xl, paddingTop: Spacing.xxl },
  logoContainer:  { alignItems: 'center', marginBottom: Spacing.xl },
  logo:           { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText:       { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  form:           { backgroundColor: Colors.darkCard, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.darkBorder },
  formTitle:      { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginBottom: 4 },
  formSubtitle:   { color: Colors.textMuted, fontSize: FontSize.sm, marginBottom: Spacing.lg },
  field:          { gap: 6, marginBottom: Spacing.md },
  label:          { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
  inputWrap:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.dark, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, borderWidth: 1, borderColor: Colors.darkBorder },
  input:          { flex: 1, color: Colors.text, fontSize: FontSize.md, paddingVertical: 14 },
  registerBtn:    { backgroundColor: Colors.secondary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  registerBtnText:{ color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  loginLink:      { alignItems: 'center', paddingTop: Spacing.md },
  loginLinkText:  { color: Colors.textMuted, fontSize: FontSize.sm },
});
