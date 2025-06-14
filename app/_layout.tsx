import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import MusicPlayer from '@/components/MusicPlayer';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 创建自定义主题 - Spotify风格
  const spotifyTheme = {
    ...(colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(colorScheme === 'dark' ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: '#1DB954', // Spotify绿色
      secondary: '#121212', // 几乎黑色的背景
      background: '#121212', // 几乎黑色的背景
      surface: '#181818', // 稍微亮一点的黑色
      text: '#FFFFFF',
      onSurface: '#FFFFFF',
      inactive: '#b3b3b3', // 灰色，用于非活跃项
    },
  };

  // 深色导航主题
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#121212',
      card: '#121212',
    },
  };

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <PaperProvider theme={spotifyTheme}>
      <ThemeProvider value={customDarkTheme}>
        <PlayerProvider>
          <View style={{ flex: 1, backgroundColor: '#121212' }}>
            <Stack 
              screenOptions={{ 
                headerShown: false, 
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: '#121212' }
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="local-music" />
              <Stack.Screen name="favorites" />
              <Stack.Screen name="downloads" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="light" />
            <MusicPlayer />
          </View>
        </PlayerProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}
