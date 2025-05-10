import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  
  // Spotify主题颜色
  const spotifyColors = {
    primary: '#1DB954', // Spotify绿色
    background: '#121212', // 几乎黑色的背景
    card: '#181818', // 稍微亮一点的黑色
    text: '#FFFFFF',
    inactive: '#b3b3b3', // 灰色，用于非活跃项
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: spotifyColors.primary,
        tabBarInactiveTintColor: spotifyColors.inactive,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // 使用透明背景在iOS上显示模糊效果
            position: 'absolute',
            backgroundColor: spotifyColors.background,
          },
          default: {
            backgroundColor: spotifyColors.background,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '搜索',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: '音乐库',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="books.vertical.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
