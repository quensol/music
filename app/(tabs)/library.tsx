import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, IconButton, Text, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// 播放列表示例数据
const playlists = [
  { 
    id: 1, 
    name: '我喜欢的音乐', 
    description: '40首歌曲',
    image: 'https://i.scdn.co/image/ab67706f00000002ca5a7517156021292e5663a4'
  },
  { 
    id: 2, 
    name: '每日推荐', 
    description: '根据你的收听习惯推荐',
    image: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebcdce7620dc940db079bf4952/1/zh/default'
  },
  { 
    id: 3, 
    name: '心情舒缓', 
    description: '轻松的音乐帮你放松心情',
    image: 'https://i.scdn.co/image/ab67706f000000025551996f500ba876bda73fa5'
  },
  { 
    id: 4, 
    name: '专注工作', 
    description: '提高工作效率的音乐集',
    image: 'https://i.scdn.co/image/ab67706f00000002724554ed6bed6f051d9b0bfc'
  },
  { 
    id: 5, 
    name: '流行热歌', 
    description: '当下最流行的歌曲',
    image: 'https://i.scdn.co/image/ab67706f0000000278b4745cb9ce8ffe32d778b8'
  },
];

// 定义APP路径类型
type AppRoutes = 
  | '/local-music' 
  | '/favorites' 
  | '/downloads' 
  | '/(tabs)/explore';

export default function LibraryScreen() {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState('最近');
  const [isNavigating, setIsNavigating] = useState(false);
  
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
    // 这里稍后实现播放列表打开逻辑
    console.log('打开播放列表:', playlist.name);
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
    <SafeAreaView style={[styles.container, { backgroundColor: spotifyColors.background }]}>
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
    </SafeAreaView>
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