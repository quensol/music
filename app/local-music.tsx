import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import SongList, { Song } from '../components/SongList';

// 本地歌曲示例数据
const localSongs: Song[] = [
  {
    id: 1,
    title: '晴天',
    artist: '周杰伦',
    duration: '4:29',
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273e0c149edd6aaca32847a261c'
  },
  {
    id: 2,
    title: '青花瓷',
    artist: '周杰伦',
    duration: '3:59',
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273f0dcb8516c950c5779d95a1f'
  },
  {
    id: 3,
    title: '稻香',
    artist: '周杰伦',
    duration: '3:42',
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27354e28cc1d38e755824433b7f'
  },
  {
    id: 4,
    title: '七里香',
    artist: '周杰伦',
    duration: '4:20',
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273a12cb82086657b2ef62834f4'
  },
  {
    id: 5,
    title: '简单爱',
    artist: '周杰伦',
    duration: '4:32',
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2734c5b9983c0d05efdcae989ae'
  },
  {
    id: 6,
    title: '一路向北',
    artist: '周杰伦',
    duration: '4:55',
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273c4d01c2c27a8abd43b6f7900'
  },
  {
    id: 7,
    title: '安静',
    artist: '周杰伦',
    duration: '5:34',
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2734c5b9983c0d05efdcae989ae'
  },
  {
    id: 8,
    title: '夜曲',
    artist: '周杰伦',
    duration: '3:46',
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273f0dcb8516c950c5779d95a1f'
  },
  {
    id: 9,
    title: '菊花台',
    artist: '周杰伦',
    duration: '4:42',
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273f0dcb8516c950c5779d95a1f'
  },
  {
    id: 10,
    title: '不能说的秘密',
    artist: '周杰伦',
    duration: '4:56',
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273a8c3c9d94df2967ba8a9a8b0'
  },
];

// Spotify主题颜色
const spotifyColors = {
  primary: '#1DB954', // Spotify绿色
  background: '#121212', // 几乎黑色的背景
  card: '#181818', // 稍微亮一点的黑色
  text: '#FFFFFF',
  inactive: '#b3b3b3', // 灰色，用于非活跃项
};

export default function LocalMusicScreen() {
  const router = useRouter();
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  
  // 处理歌曲点击事件
  const handleSongPress = (song: Song) => {
    // 这里稍后实现播放逻辑
    console.log('播放歌曲:', song.title);
  };

  // 添加防抖返回功能
  const handleBackPress = useCallback(() => {
    if (isNavigatingBack) return;
    
    setIsNavigatingBack(true);
    router.back();
    
    // 防止多次点击
    setTimeout(() => {
      setIsNavigatingBack(false);
    }, 1000);
  }, [router, isNavigatingBack]);

  return (
    <View style={{ flex: 1, backgroundColor: spotifyColors.background }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <View style={styles.backButtonContainer}>
              <IconButton 
                icon="arrow-left" 
                iconColor={spotifyColors.text} 
                size={24} 
                onPress={handleBackPress}
                style={styles.backButton}
                disabled={isNavigatingBack}
              />
            </View>
            <Text style={[styles.title, { color: spotifyColors.text }]}>本地音乐</Text>
          </View>
          <View style={styles.headerIcons}>
            <IconButton 
              icon="magnify" 
              iconColor={spotifyColors.text} 
              size={24} 
              onPress={() => {}} 
              style={styles.iconButton}
            />
            <IconButton 
              icon="sort" 
              iconColor={spotifyColors.text} 
              size={24} 
              onPress={() => {}} 
              style={styles.iconButton}
            />
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: spotifyColors.inactive }]}>
            共 {localSongs.length} 首歌曲
          </Text>
          <View style={styles.playButtonContainer}>
            <IconButton 
              icon="play-circle" 
              iconColor={spotifyColors.primary} 
              size={36} 
              onPress={() => {}} 
              style={styles.playButton}
            />
          </View>
        </View>
        
        <ScrollView style={{ flex: 1 }}>
          <SongList 
            songs={localSongs} 
            onSongPress={handleSongPress}
            backgroundColor={spotifyColors.background}
            textColor={spotifyColors.text}
            secondaryTextColor={spotifyColors.inactive}
          />
        </ScrollView>
      </SafeAreaView>
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
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  backButton: {
    margin: 0,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    margin: 0,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
  },
  playButtonContainer: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  playButton: {
    margin: 0,
  }
}); 