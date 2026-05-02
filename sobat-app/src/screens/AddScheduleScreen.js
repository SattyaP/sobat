import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FloatingInput from '../components/FloatingInput';
import ScalePressable from '../components/ScalePressable';
import SkeletonBlock from '../components/SkeletonBlock';
import client from '../api/client';
import { colors, fonts, radius, shadows, spacing } from '../theme/tokens';

export default function AddScheduleScreen({ navigation, route }) {
  const existingSchedule = route?.params?.schedule ?? null;
  const isEditMode = Boolean(existingSchedule?.id);
  const [medications, setMedications] = useState([]);
  const [medicationId, setMedicationId] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await client.get('/medications');
      const list = Array.isArray(response?.data?.data) ? response.data.data : [];
      setMedications(list);

      if (list.length > 0 && !isEditMode) {
        setMedicationId(String(list[0].id));
      }
    } catch (error) {
      console.error('Gagal memuat daftar obat:', error);
      Alert.alert('Gagal', 'Gagal memuat daftar obat.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!medicationId || !scheduledTime) {
        Alert.alert('Validasi', 'Pilih obat dan isi waktu minum terlebih dahulu.');
        return;
      }

      setLoading(true);
      const payload = {
        medication_id: Number(medicationId),
        scheduled_time: scheduledTime,
      };

      if (isEditMode) {
        await client.put(`/schedules/${existingSchedule.id}`, payload);
      } else {
        await client.post('/schedules', payload);
      }

      Alert.alert(
        'Berhasil',
        isEditMode ? 'Perubahan jadwal berhasil disimpan.' : 'Jadwal obat berhasil ditambahkan.'
      );
      navigation.goBack();
    } catch (error) {
      console.error('Gagal menyimpan jadwal obat:', error);
      const message =
        error?.response?.data?.message ||
        'Gagal menyimpan jadwal. Gunakan format waktu 24 jam (contoh: 08:00).';
      Alert.alert('Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    if (!existingSchedule) {
      return;
    }

    setMedicationId(
      String(existingSchedule.medication_id ?? existingSchedule.medication?.id ?? '')
    );
    setScheduledTime(existingSchedule.scheduled_time ?? '');
  }, [existingSchedule]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{isEditMode ? 'Edit Jadwal' : 'Tambah Jadwal'}</Text>
          <Text style={styles.subtitle}>
            {isEditMode
              ? 'Perbarui jadwal minum obat Anda.'
              : 'Atur jam minum obat agar ritme harian tetap nyaman.'}
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Pilih Obat</Text>
            {loading && medications.length === 0 ? (
              <SkeletonBlock style={{ height: 54, borderRadius: radius.lg }} />
            ) : (
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={medicationId}
                  onValueChange={(value) => setMedicationId(String(value))}
                >
                  {medications.map((item) => (
                    <Picker.Item key={item.id} label={item.name} value={String(item.id)} />
                  ))}
                </Picker>
              </View>
            )}

            <FloatingInput
              label="Waktu Minum (24 jam)"
              value={scheduledTime}
              onChangeText={setScheduledTime}
            />

            <ScalePressable
              style={[styles.submitWrap, loading ? styles.disabled : null]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <View style={styles.submitButton}>
                <Text style={styles.submitText}>
                  {loading ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Jadwal'}
                </Text>
              </View>
            </ScalePressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
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
  label: {
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: -8,
  },
  pickerWrap: {
    borderRadius: radius.lg,
    backgroundColor: '#EEF3F2',
    overflow: 'hidden',
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
