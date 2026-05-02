import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScalePressable from '../components/ScalePressable';
import SkeletonBlock from '../components/SkeletonBlock';
import client from '../api/client';
import { colors, fonts, radius, shadows, spacing } from '../theme/tokens';

export default function MedicationListScreen({ navigation }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await client.get('/medications');
      const list = response?.data?.data;
      setMedications(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Gagal memuat daftar obat:', error);
      Alert.alert('Gagal', 'Gagal memuat daftar obat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMedications();
    }, [fetchMedications])
  );

  const handleDeleteMedication = (medicationId) => {
    Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin menghapus ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/medications/${medicationId}`);
            await fetchMedications();
          } catch (error) {
            console.error('Gagal menghapus obat:', error);
            Alert.alert('Gagal', 'Gagal menghapus data obat.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Daftar Obat</Text>
        <Text style={styles.subtitle}>
          Kelola daftar obat harian dengan tampilan yang lebih tenang.
        </Text>

        {loading && medications.length === 0 ? (
          <View style={{ gap: spacing.sm }}>
            <SkeletonBlock style={{ height: 120, borderRadius: radius.xl }} />
            <SkeletonBlock style={{ height: 120, borderRadius: radius.xl }} />
            <SkeletonBlock style={{ height: 120, borderRadius: radius.xl }} />
          </View>
        ) : (
          <FlatList
            data={medications}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Belum ada obat tersimpan</Text>
                <Text style={styles.emptyText}>Tambahkan obat pertama Anda dari tombol di kanan bawah.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTop}>
                    <View style={styles.iconWrap}>
                      <Ionicons name="leaf-outline" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.medicationName}>{item.name}</Text>
                  </View>

                  <View style={styles.actionRow}>
                    <ScalePressable
                      onPress={() => navigation.navigate('TambahObat', { medication: item })}
                    >
                      <Ionicons name="create-outline" size={20} color={colors.accent} />
                    </ScalePressable>
                    <ScalePressable onPress={() => handleDeleteMedication(item.id)}>
                      <Ionicons name="trash-outline" size={20} color={colors.warning} />
                    </ScalePressable>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Dosis</Text>
                  <Text style={styles.metaValue}>{item.dosage}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Frekuensi</Text>
                  <Text style={styles.metaValue}>{item.frequency} kali per hari</Text>
                </View>
              </View>
            )}
          />
        )}

        <View style={styles.fabGroup}>
          <ScalePressable
            style={styles.fabWrap}
            onPress={() => navigation.navigate('TambahJadwal')}
            accessibilityLabel="Tambah jadwal"
          >
            <View style={[styles.fab, styles.fabSecondary]}>
              <Ionicons name="time-outline" size={23} color="#FFFFFF" />
            </View>
          </ScalePressable>

          <ScalePressable
            style={styles.fabWrap}
            onPress={() => navigation.navigate('TambahObat')}
            accessibilityLabel="Tambah obat"
          >
            <View style={styles.fab}>
              <Ionicons name="add" size={27} color="#FFFFFF" />
            </View>
          </ScalePressable>
        </View>
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
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    paddingHorizontal: 16,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    lineHeight: 22,
    fontSize: 15,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.sm,
    ...shadows.card,
    gap: spacing.xs,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicationName: {
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaValue: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    fontSize: 17,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  fabGroup: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  fabWrap: {
    borderRadius: radius.pill,
    ...shadows.button,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabSecondary: {
    backgroundColor: colors.accent,
  },
});
