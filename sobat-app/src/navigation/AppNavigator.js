import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SkeletonBlock from '../components/SkeletonBlock';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import AddScheduleScreen from '../screens/AddScheduleScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import MedicationListScreen from '../screens/MedicationListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { colors, fonts } from '../theme/tokens';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        animation: 'fade_from_bottom',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: fonts.semibold, color: colors.textPrimary },
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Masuk' }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Daftar' }}
      />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        animation: 'fade',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: fonts.semibold, color: colors.textPrimary },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12, marginBottom: 4 },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 0,
          borderRadius: 20,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          backgroundColor: colors.surface,
          elevation: 4,
          shadowColor: '#000000',
          shadowOpacity: 0.06,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 4 },
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Beranda') {
            return <Ionicons name="home-outline" size={size} color={color} />;
          }

          if (route.name === 'Profil') {
            return <Ionicons name="person-outline" size={size} color={color} />;
          }

          return <Ionicons name="reader-outline" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Beranda"
        component={DashboardScreen}
        options={{ title: 'Beranda' }}
      />
      <Tab.Screen
        name="DaftarObat"
        component={MedicationListScreen}
        options={{ title: 'Daftar Obat' }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        animation: 'fade_from_bottom',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: fonts.semibold, color: colors.textPrimary },
      }}
    >
      <MainStack.Screen
        name="TabUtama"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="TambahObat"
        component={AddMedicationScreen}
        options={{ title: 'Tambah Obat' }}
      />
      <MainStack.Screen
        name="TambahJadwal"
        component={AddScheduleScreen}
        options={{ title: 'Tambah Jadwal' }}
      />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Auth');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        setInitialRoute(token ? 'Main' : 'Auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <SkeletonBlock style={{ height: 20, width: 140, marginBottom: 24 }} />
        <SkeletonBlock style={{ height: 86, width: '100%', marginBottom: 16 }} />
        <SkeletonBlock style={{ height: 86, width: '100%', marginBottom: 16 }} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.background,
          text: colors.textPrimary,
        },
      }}
    >
      <RootStack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="Main" component={MainNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 88,
  },
});
