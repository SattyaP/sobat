import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import client from '../api/client';
import ScalePressable from '../components/ScalePressable';
import { colors, fonts, radius, shadows, spacing } from '../theme/tokens';

const menuItems = [
  { icon: 'notifications-outline', title: 'Pengingat Notifikasi', subtitle: 'Atur jadwal pengingat obat' },
  { icon: 'shield-checkmark-outline', title: 'Privasi Data', subtitle: 'Kelola izin dan keamanan akun' },
  { icon: 'help-circle-outline', title: 'Bantuan', subtitle: 'Pusat bantuan dan dukungan aplikasi' },
];

export default function ProfileScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await client.post('/logout');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('auth_token');

      let rootNav = navigation;
      while (rootNav?.getParent?.()) {
        rootNav = rootNav.getParent();
      }

      rootNav.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Gagal keluar dari aplikasi:', error);
      Alert.alert('Gagal', 'Gagal keluar dari aplikasi.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>

        <View style={styles.avatarCard}>
          <Image source={{ uri: 'https://i.pravatar.cc/120?img=12' }} style={styles.avatar} />
          <Text style={styles.name}>Pengguna SOBAT</Text>
          <Text style={styles.email}>akun@contoh.com</Text>
        </View>

        <View style={styles.listWrap}>
          {menuItems.map((item) => (
            <View key={item.title} style={styles.menuCard}>
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={colors.accent} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color={colors.textMuted} />
            </View>
          ))}
        </View>

        <ScalePressable style={styles.logoutWrap} onPress={handleLogout}>
          <View style={styles.logoutCard}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Keluar</Text>
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  avatarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  name: {
    marginTop: 12,
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 18,
  },
  email: {
    marginTop: 4,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  listWrap: {
    gap: 12,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.sm,
    ...shadows.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  menuSubtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  logoutWrap: {
    borderRadius: radius.lg,
    marginTop: 'auto',
    marginBottom: 100,
    ...shadows.button,
  },
  logoutCard: {
    backgroundColor: '#D9534F',
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
