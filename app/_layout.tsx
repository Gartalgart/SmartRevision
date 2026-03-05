import FontAwesome from '@expo/vector-icons/FontAwesome';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useAuthStore } from '../stores/authStore';

import { StatusBar } from 'expo-status-bar';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useThemeStore } from '../stores/themeStore';
import { useTheme } from '../utils/styles';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)', // On vise directement les tabs
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) console.error('Erreur chargement polices:', error);
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const { initialize } = useAuthStore();
  const isDark = useThemeStore(state => state.isDark);
  const theme = useTheme();

  useEffect(() => {
    // Initialisation simple
    initialize();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: withTiming(theme.background),
  }));

  return (
    <Animated.View style={animatedStyle}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="review"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Révision',
          }}
        />
        <Stack.Screen
          name="add-word"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Nouveau mot',
          }}
        />
      </Stack>
    </Animated.View>
  );
}
