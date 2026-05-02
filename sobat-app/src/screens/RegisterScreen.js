import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScalePressable from '../components/ScalePressable';
import FloatingInput from '../components/FloatingInput';
import client from '../api/client';
import { colors, fonts, radius, shadows, spacing } from '../theme/tokens';

export default function RegisterScreen({ navigation, onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await client.post('/register', form);
      Alert.alert('Berhasil', 'Pendaftaran berhasil. Silakan masuk.');

      if (onSwitchToLogin) {
        onSwitchToLogin();
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Gagal daftar:', error);
      const message =
        error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat pendaftaran.';

      Alert.alert('Gagal daftar', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.overline}>Buat akun baru</Text>
        <Text style={styles.title}>Mulai bersama Sobat</Text>
        <Text style={styles.subtitle}>Satu langkah sederhana untuk pengingat obat yang lebih nyaman.</Text>

        <View style={styles.formCard}>
          <FloatingInput
            label="Nama Lengkap"
            value={form.name}
            onChangeText={(value) => handleChange('name', value)}
          />
          <FloatingInput
            label="Email"
            value={form.email}
            onChangeText={(value) => handleChange('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <FloatingInput
            label="Kata Sandi"
            value={form.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry
            autoCapitalize="none"
          />
          <FloatingInput
            label="Konfirmasi Kata Sandi"
            value={form.password_confirmation}
            onChangeText={(value) => handleChange('password_confirmation', value)}
            secureTextEntry
            autoCapitalize="none"
          />

          <ScalePressable
            style={[styles.buttonWrap, loading ? styles.disabled : null]}
            onPress={handleRegister}
            disabled={loading}
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>{loading ? 'Memproses...' : 'Daftar'}</Text>
            </View>
          </ScalePressable>
        </View>

        <ScalePressable
          onPress={() => (onSwitchToLogin ? onSwitchToLogin() : navigation.navigate('Login'))}
        >
          <Text style={styles.link}>Sudah punya akun? Masuk</Text>
        </ScalePressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  overline: {
    fontFamily: fonts.medium,
    color: colors.primary,
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 34,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: spacing.md,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.card,
  },
  buttonWrap: {
    marginTop: 4,
    borderRadius: radius.lg,
    ...shadows.button,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.65,
  },
  link: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontFamily: fonts.medium,
    color: colors.accent,
    fontSize: 15,
  },
});
