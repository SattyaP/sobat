import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import client from '../api/client';
import ScalePressable from '../components/ScalePressable';
import SkeletonBlock from '../components/SkeletonBlock';
import { colors, fonts, radius, shadows, spacing } from '../theme/tokens';

export default function DashboardScreen({ navigation }) {
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statisticsResponse, schedulesResponse] = await Promise.all([
        client.get('/statistics'),
        client.get('/schedules/today'),
      ]);

      setOverallPercentage(Number(statisticsResponse?.data?.overall_percentage ?? 0));
      setSchedules(Array.isArray(schedulesResponse?.data?.data) ? schedulesResponse.data.data : []);
    } catch (error) {
      console.error('Gagal memuat data dasbor:', error);
      Alert.alert('Gagal', 'Gagal memuat data dasbor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const handleConfirmMedication = async (scheduleId) => {
    try {
      if (!scheduleId) {
        Alert.alert('Validasi', 'Belum ada jadwal untuk dikonfirmasi.');
        return;
      }

      setConfirming(true);
      const response = await client.post(`/schedules/${scheduleId}/confirm`);
      const adherenceScore = response?.data?.adherence_score ?? 0;
      const prediction = response?.data?.prediction;
      const statusLabel = prediction === 1 ? 'Patuh' : 'Tidak Patuh';

      Alert.alert(`Berhasil! Skor Kepatuhan AI: ${adherenceScore}% - Status: ${statusLabel}`);
      await fetchDashboardData();
    } catch (error) {
      console.error('Gagal mengonfirmasi jadwal obat:', error);
      Alert.alert('Gagal', 'Gagal mengonfirmasi jadwal obat.');
    } finally {
      setConfirming(false);
    }
  };

  const progressWidth = `${Math.min(100, Math.max(0, Math.round(overallPercentage || 0)))}%`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={schedules}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>Dasbor Utama</Text>
                <Text style={styles.headerSubtitle}>
                  {loading ? 'Menyiapkan ringkasan harian...' : 'Pantau ritme minum obat Anda.'}
                </Text>
              </View>
              <Image source={{ uri: 'https://i.pravatar.cc/120?img=12' }} style={styles.avatar} />
            </View>

            {loading ? (
              <View style={styles.heroSkeleton}>
                <SkeletonBlock style={{ height: 16, width: 140, marginBottom: 12 }} />
                <SkeletonBlock style={{ height: 44, width: 96, marginBottom: 14 }} />
                <SkeletonBlock style={{ height: 10, width: '100%', borderRadius: radius.pill }} />
              </View>
            ) : (
              <LinearGradient
                colors={['#6D9FA0', '#7C96BC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <Text style={styles.heroLabel}>Tingkat Kepatuhan</Text>
                <Text style={styles.heroValue}>{Math.round(overallPercentage || 0)}%</Text>
                <View style={styles.heroTrack}>
                  <View style={[styles.heroFill, { width: progressWidth }]} />
                </View>
              </LinearGradient>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Jadwal Hari Ini</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Belum ada jadwal hari ini</Text>
              <Text style={styles.emptyText}>Tambahkan jadwal baru agar pengingat berjalan otomatis.</Text>
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <SkeletonBlock style={{ height: 96, borderRadius: radius.xl }} />
              <SkeletonBlock style={{ height: 96, borderRadius: radius.xl }} />
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.scheduleCard}>
            <View style={styles.iconWrap}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </View>

            <View style={styles.scheduleContent}>
              <Text style={styles.scheduleTitle}>{item?.medication?.name ?? 'Obat Tidak Diketahui'}</Text>
              <Text style={styles.scheduleSubtitle}>Dosis: {item?.medication?.dosage ?? '-'}</Text>
            </View>

            <View style={styles.rightColumn}>
              <ScalePressable
                style={[styles.confirmMiniWrap, confirming ? styles.disabled : null]}
                onPress={() => handleConfirmMedication(item.id)}
                disabled={confirming}
              >
                <View style={styles.confirmMiniButton}>
                  <Text style={styles.confirmMiniText}>
                    {confirming ? 'Memproses...' : 'Konfirmasi Minum Obat'}
                  </Text>
                </View>
              </ScalePressable>

              <View style={styles.timeBadge}>
                <Text style={styles.scheduleTime}>{item?.scheduled_time ?? '-'}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    marginBottom: spacing.md,
    fontSize: 15,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  heroSkeleton: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
  heroLabel: {
    color: '#EAF6F5',
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  heroValue: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 44,
    fontFamily: fonts.bold,
  },
  heroTrack: {
    marginTop: 16,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.32)',
    overflow: 'hidden',
  },
  heroFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 21,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  confirmWrap: {
    borderRadius: radius.lg,
    ...shadows.button,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  confirmMiniWrap: {
    borderRadius: radius.md,
    ...shadows.button,
  },
  confirmMiniButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  confirmMiniText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  scheduleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.sm,
    ...shadows.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  scheduleSubtitle: {
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 10,
  },
  timeBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scheduleTime: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 13,
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
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    lineHeight: 22,
    fontSize: 14,
  },
});
