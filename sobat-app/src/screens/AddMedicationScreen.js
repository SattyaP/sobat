import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FloatingInput from '../components/FloatingInput';
import ScalePressable from '../components/ScalePressable';
import client from '../api/client';
import { colors, fonts, radius, shadows, spacing } from '../theme/tokens';

export default function AddMedicationScreen({ navigation, route }) {
  const existingMedication = route?.params?.medication ?? null;
  const isEditMode = Boolean(existingMedication?.id);
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existingMedication) {
      return;
    }

    setForm({
      name: existingMedication.name ?? '',
      dosage: existingMedication.dosage ?? '',
      frequency: String(existingMedication.frequency ?? ''),
    });
  }, [existingMedication]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const payload = {
        name: form.name,
        dosage: form.dosage,
        frequency: Number(form.frequency),
        notes: null,
      };

      if (isEditMode) {
        await client.put(`/medications/${existingMedication.id}`, payload);
      } else {
        await client.post('/medications', payload);
      }

      Alert.alert('Berhasil', isEditMode ? 'Perubahan obat berhasil disimpan.' : 'Obat berhasil ditambahkan.');
      navigation.goBack();
    } catch (error) {
      console.error('Gagal menyimpan obat:', error);
      const message = error?.response?.data?.message || 'Gagal menyimpan obat. Pastikan data sudah benar.';
      Alert.alert('Gagal', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{isEditMode ? 'Edit Obat' : 'Tambah Obat'}</Text>
          <Text style={styles.subtitle}>
            {isEditMode ? 'Perbarui detail obat Anda dengan mudah.' : 'Isi detail obat dengan sederhana dan jelas.'}
          </Text>

          <View style={styles.card}>
            <FloatingInput
              label="Nama Obat"
              value={form.name}
              onChangeText={(value) => handleChange('name', value)}
            />
            <FloatingInput
              label="Dosis"
              value={form.dosage}
              onChangeText={(value) => handleChange('dosage', value)}
            />
            <FloatingInput
              label="Frekuensi per hari"
              value={form.frequency}
              onChangeText={(value) => handleChange('frequency', value)}
              keyboardType="numeric"
            />

            <ScalePressable
              style={[styles.submitWrap, saving ? styles.disabled : null]}
              onPress={handleSubmit}
              disabled={saving}
            >
              <View style={styles.submitButton}>
                <Text style={styles.submitText}>
                  {saving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Obat'}
                </Text>
              </View>
            </ScalePressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: spacing.md,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.card,
  },
  submitWrap: {
    marginTop: spacing.xs,
    borderRadius: radius.lg,
    ...shadows.button,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.65,
  },
});
