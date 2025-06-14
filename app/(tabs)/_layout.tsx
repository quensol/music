import type { MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';


const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  // Spotify主题颜色
  const spotifyColors = {
    primary: '#1DB954', // Spotify绿色
    background: '#121212', // 几乎黑色的背景
    card: '#181818', // 稍微亮一点的黑色
    text: '#FFFFFF',
    inactive: '#b3b3b3', // 灰色，用于非活跃项
  };

  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarActiveTintColor: spotifyColors.primary,
        tabBarInactiveTintColor: spotifyColors.inactive,
        tabBarStyle: {
          backgroundColor: spotifyColors.background,
          paddingTop: Platform.select({
            ios: 60, // 为iOS状态栏留出更多空间
            android: 50, // 为Android状态栏留出更多空间
            default: 50,
          }),
          height: Platform.select({
            ios: 120, // iOS总高度
            android: 110, // Android总高度
            default: 110,
          }),
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIndicatorStyle: {
          backgroundColor: spotifyColors.primary,
          height: 3,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          textTransform: 'none',
        },
        tabBarItemStyle: {
          paddingVertical: 16,
          height: 60, // 增加每个tab项的高度
        },
      }}>
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: '首页',
        }}
      />
      <MaterialTopTabs.Screen
        name="search"
        options={{
          title: '搜索',
        }}
      />
      <MaterialTopTabs.Screen
        name="library"
        options={{
          title: '音乐库',
        }}
      />
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: '我的',
        }}
      />
    </MaterialTopTabs>
  );
}
