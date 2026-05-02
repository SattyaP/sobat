import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScalePressable from '../components/ScalePressable';
import FloatingInput from '../components/FloatingInput';
import client from '../api/client';
import { colors, fonts, radius, shadows, spacing } from '../theme/tokens';

export default function LoginScreen({ navigation, onSwitchToRegister }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await client.post('/login', form);
      const token = response?.data?.token;

      if (!token) {
        Alert.alert('Gagal masuk', 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
        return;
      }

      await AsyncStorage.setItem('auth_token', token);
      Alert.alert('Berhasil masuk!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Gagal masuk:', error);
      Alert.alert('Gagal masuk', 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.overline}>Selamat datang kembali</Text>
        <Text style={styles.title}>Masuk ke Sobat</Text>
        <Text style={styles.subtitle}>Ruang tenang untuk rutinitas obat harian Anda.</Text>

        <View style={styles.formCard}>
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

          <ScalePressable
            style={[styles.buttonWrap, loading ? styles.disabled : null]}
            onPress={handleLogin}
            disabled={loading}
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>{loading ? 'Memproses...' : 'Masuk'}</Text>
            </View>
          </ScalePressable>
        </View>

        <ScalePressable
          onPress={() =>
            onSwitchToRegister ? onSwitchToRegister() : navigation.navigate('Register')
          }
        >
          <Text style={styles.link}>Belum punya akun? Daftar</Text>
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
