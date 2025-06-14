import { getAllPlaylists } from '@/config/playlists';
import { usePlayer } from '@/contexts/PlayerContext';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, IconButton, Text, TouchableRipple } from 'react-native-paper';

// 定义APP路径类型
type AppRoutes = 
  | '/local-music' 
  | '/favorites' 
  | '/downloads';

export default function LibraryScreen() {
  const router = useRouter();
  const { recentlyPlayed } = usePlayer();
  const [sortOrder, setSortOrder] = useState('最近');
  const [isNavigating, setIsNavigating] = useState(false);
  
  // 获取歌单数据
  const staticPlaylists = getAllPlaylists();
  
  // 创建完整的歌单列表，最近播放在顶部
  const playlists = [
    {
      id: 'recently-played',
      name: '最近播放',
      description: `${recentlyPlayed.length}首歌曲`,
      image: 'https://i.scdn.co/image/ab67706f00000002ca5a7517156021292e5663a4'
    },
    ...staticPlaylists.filter(p => p.id !== 'recently-played') // 过滤掉静态配置中的最近播放
  ];

  // Spotify主题颜色
  const spotifyColors = {
    primary: '#1DB954', // Spotify绿色
    background: '#121212', // 几乎黑色的背景
    card: '#181818', // 稍微亮一点的黑色
    text: '#FFFFFF',
    inactive: '#b3b3b3', // 灰色，用于非活跃项
  };

  // 处理播放列表点击事件
  const handlePlaylistPress = (playlist: any) => {
    router.push(`/playlist/${playlist.id}` as any);
  };

  // 添加防抖导航功能
  const navigateWithDebounce = useCallback((path: AppRoutes) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    router.push(path);
    
    // 1秒后重置导航状态，允许下一次导航
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  }, [router, isNavigating]);

  // 处理导航到本地音乐页面
  const navigateToLocalMusic = () => {
    navigateWithDebounce('/local-music');
  };

  // 处理导航到我的收藏页面
  const navigateToFavorites = () => {
    navigateWithDebounce('/favorites');
  };

  // 处理导航到已下载页面
  const navigateToDownloads = () => {
    navigateWithDebounce('/downloads');
  };

  // 渲染顶部选项卡
  const renderTopOptions = () => {
    const options = [
      { id: 'local', name: '本地音乐', icon: 'music-note', onPress: navigateToLocalMusic },
      { id: 'favorites', name: '我的收藏', icon: 'heart', onPress: navigateToFavorites },
      { id: 'downloads', name: '已下载', icon: 'download', onPress: navigateToDownloads }
    ];
    
    return (
      <Card style={styles.topCard}>
        <Card.Content style={styles.topCardContent}>
          {options.map((option) => (
            <TouchableRipple
              key={option.id}
              style={[
                styles.optionButton,
                isNavigating && { opacity: 0.7 } // 导航中时按钮变暗
              ]}
              onPress={option.onPress}
              borderless
              rippleColor="rgba(255, 255, 255, 0.2)"
              disabled={isNavigating} // 导航中禁用按钮
            >
              <View style={styles.optionContent}>
                <IconButton
                  icon={option.icon}
                  iconColor={spotifyColors.text}
                  size={24}
                  disabled={isNavigating}
                />
                <Text style={[styles.optionText, { color: spotifyColors.text }]}>
                  {option.name}
                </Text>
              </View>
            </TouchableRipple>
          ))}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: spotifyColors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/40' }} 
            style={styles.profileImage} 
          />
          <Text style={[styles.title, { color: spotifyColors.text }]}>音乐库</Text>
        </View>
        <View style={styles.headerIcons}>
          <IconButton 
            icon="magnify" 
            iconColor={spotifyColors.text} 
            size={24} 
            onPress={() => {}} 
          />
          <IconButton 
            icon="cog" 
            iconColor={spotifyColors.text} 
            size={24} 
            onPress={() => {}} 
          />
        </View>
      </View>
      
      {renderTopOptions()}
      
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: spotifyColors.text }]}>我的歌单</Text>
        <TouchableRipple 
          onPress={() => {}}
          borderless
          style={styles.addButton}
        >
          <IconButton 
            icon="plus" 
            iconColor={spotifyColors.text} 
            size={24} 
          />
        </TouchableRipple>
      </View>
      
      <ScrollView style={{ flex: 1 }}>
        {playlists.map((playlist, index) => (
          <MotiView
            key={playlist.id}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ 
              type: 'timing', 
              duration: 400, 
              delay: index * 100
            }}
          >
            <View style={styles.playlistItemContainer}>
              <TouchableRipple 
                onPress={() => handlePlaylistPress(playlist)}
                style={styles.playlistRipple}
                borderless
                rippleColor="rgba(255, 255, 255, 0.2)"
              >
                <View style={styles.playlistItem}>
                  <Image source={{ uri: playlist.image }} style={styles.playlistImage} />
                  <View style={styles.playlistInfo}>
                    <Text style={{ color: spotifyColors.text, fontWeight: 'bold' }}>{playlist.name}</Text>
                    <Text style={{ color: spotifyColors.inactive }}>{playlist.description}</Text>
                  </View>
                </View>
              </TouchableRipple>
            </View>
            {index < playlists.length - 1 && (
              <Divider style={{ backgroundColor: spotifyColors.inactive, opacity: 0.1 }} />
            )}
          </MotiView>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  topCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#181818',
    elevation: 4,
  },
  topCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 0,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 4,
  },
  optionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontWeight: '500',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    borderRadius: 20,
  },
  playlistItemContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
  },
  playlistRipple: {
    borderRadius: 8,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 16,
  },
  playlistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
}); 