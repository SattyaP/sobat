import { StatusBar } from 'expo-status-bar';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingWrap}>
          <View style={[styles.skeleton, { width: 160, height: 24 }]} />
          <View style={[styles.skeleton, { width: '100%', height: 72, marginTop: 24 }]} />
          <View style={[styles.skeleton, { width: '100%', height: 72, marginTop: 16 }]} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
    paddingTop: 96,
  },
  skeleton: {
    borderRadius: 14,
    backgroundColor: '#E4E9EE',
  },
});
