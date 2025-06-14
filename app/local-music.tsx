import { Song as PlayerSong, usePlayer } from '@/contexts/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { pinyin } from 'pinyin-pro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, IconButton, Text, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlbumWall, { Album as AlbumType } from '../components/AlbumWall';
import AlphabetIndex from '../components/AlphabetIndex';
import SongList, { Song } from '../components/SongList';
import { albums } from '../config/albums';

// 获取歌曲标题的首字母（支持中文拼音）
const getFirstLetter = (title: string): string => {
  const firstChar = title.charAt(0);
  
  // 检查是否为中文字符
  if (/[\u4e00-\u9fa5]/.test(firstChar)) {
    // 中文字符转拼音，取首字母
    const pinyinResult = pinyin(firstChar, { toneType: 'none', type: 'first' });
    return pinyinResult.toUpperCase();
  }
  
  // 英文字符直接转大写
  const upperChar = firstChar.toUpperCase();
  return /^[A-Z]$/.test(upperChar) ? upperChar : '#';
};

// 获取完整拼音用于排序
const getPinyinForSort = (title: string): string => {
  // 检查是否包含中文字符
  if (/[\u4e00-\u9fa5]/.test(title)) {
    // 转换为拼音，不带声调
    return pinyin(title, { toneType: 'none', separator: '' });
  }
  // 非中文直接返回原文
  return title;
};

// 按字母排序歌曲（支持中文拼音排序）
const sortSongsByAlphabet = (songs: Song[]): Song[] => {
  return [...songs].sort((a, b) => {
    const letterA = getFirstLetter(a.title);
    const letterB = getFirstLetter(b.title);
    
    // '#' 排在最前面
    if (letterA === '#' && letterB !== '#') return -1;
    if (letterA !== '#' && letterB === '#') return 1;
    
    // 字母排序
    if (letterA !== letterB) {
      return letterA.localeCompare(letterB);
    }
    
    // 同一字母内按拼音排序
    const pinyinA = getPinyinForSort(a.title);
    const pinyinB = getPinyinForSort(b.title);
    return pinyinA.localeCompare(pinyinB);
  });
};

// 创建字母索引映射
const createAlphabetIndex = (songs: Song[]): Map<string, number> => {
  const indexMap = new Map<string, number>();
  
  songs.forEach((song, index) => {
    const letter = getFirstLetter(song.title);
    if (!indexMap.has(letter)) {
      indexMap.set(letter, index);
    }
  });
  
  return indexMap;
};

// 将albums中的歌曲转换为本地歌曲格式
const convertAlbumsToLocalSongs = () => {
  const songs: Song[] = [];
  
  albums.forEach(album => {
    album.songs.forEach(song => {
      songs.push({
        id: song.id,
        title: song.title,
        artist: album.artist,
        album: album.title,
        duration: song.duration || '',
        albumCover: album.cover,
        file_url: song.file_url // 保留原始的file_url
      });
    });
  });
  
  return songs;
};

// 本地歌曲示例数据
const localSongs = convertAlbumsToLocalSongs();

// 艺术家接口
interface Artist {
  id: number;
  name: string;
  image: string;
  songs: Song[];
}

// 文件夹接口
interface Folder {
  id: number;
  name: string;
  count: number;
  path: string;
}

// 生成专辑数据
const generateAlbums = (): AlbumType[] => {
  const albumMap = new Map<string, AlbumType>();
  
  localSongs.forEach(song => {
    if (song.album && !albumMap.has(song.album)) {
      albumMap.set(song.album, {
        id: albumMap.size + 1,
        title: song.album,
        artist: song.artist,
        cover: song.albumCover,
        songs: []
      });
    }
    
    // 转换歌曲格式以符合AlbumType中的Song类型
    if (song.album) {
      albumMap.get(song.album)!.songs.push({
        id: song.id,
        title: song.title,
        artist: song.artist,
        file_url: song.file_url || '', // 保留原始的file_url
        duration: song.duration
      });
    }
  });
  
  return Array.from(albumMap.values());
};

// 生成艺术家数据
const generateArtists = (): Artist[] => {
  const artistMap = new Map<string, Artist>();
  
  localSongs.forEach(song => {
    if (!artistMap.has(song.artist)) {
      artistMap.set(song.artist, {
        id: artistMap.size + 1,
        name: song.artist,
        // 使用该艺术家的第一首歌的专辑封面作为艺术家图片
        image: song.albumCover,
        songs: []
      });
    }
    
    artistMap.get(song.artist)!.songs.push(song);
  });
  
  return Array.from(artistMap.values());
};

// 模拟文件夹结构
const folders: Folder[] = [
  { id: 1, name: '下载', count: 7, path: '/storage/download' },
  { id: 2, name: '我的收藏', count: 3, path: '/storage/favorites' },
  { id: 3, name: '最近添加', count: 2, path: '/storage/recent' },
  { id: 4, name: 'SD卡', count: 10, path: '/storage/sdcard' },
];

// Spotify主题颜色
const spotifyColors = {
  primary: '#1DB954', // Spotify绿色
  background: '#121212', // 几乎黑色的背景
  card: '#181818', // 稍微亮一点的黑色
  text: '#FFFFFF',
  inactive: '#b3b3b3', // 灰色，用于非活跃项
};

// 定义视图类型
type ViewType = 'songs' | 'albums' | 'artists' | 'folders';

export default function LocalMusicScreen() {
  const router = useRouter();
  const { playSong } = usePlayer();
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('songs');
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [sortedSongs, setSortedSongs] = useState<Song[]>([]);
  const [alphabetIndex, setAlphabetIndex] = useState<Map<string, number>>(new Map());
  const [activeIndexLetter, setActiveIndexLetter] = useState<string>('');
  const songListRef = useRef<FlatList>(null);
  
  // 初始化专辑和艺术家数据
  useEffect(() => {
    setAlbums(generateAlbums());
    setArtists(generateArtists());
    
    // 对歌曲进行字母排序并创建索引
    const sorted = sortSongsByAlphabet(localSongs);
    setSortedSongs(sorted);
    setAlphabetIndex(createAlphabetIndex(sorted));
  }, []);
  
  // 处理字母索引点击
  const handleLetterPress = (letter: string) => {
    const index = alphabetIndex.get(letter);
    if (index !== undefined && songListRef.current) {
      setActiveIndexLetter(letter);
      songListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.1, // 滚动到顶部附近
      });
      
      // 2秒后清除高亮
      setTimeout(() => {
        setActiveIndexLetter('');
      }, 2000);
    }
  };

  // 处理歌曲点击事件
  const handleSongPress = async (song: Song) => {
    console.log('播放歌曲:', song.title);
    
    // 转换为PlayerSong格式
    const playerSong: PlayerSong = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      image: song.albumCover,
      file_url: song.file_url || '', // 使用歌曲的真实file_url
      duration: typeof song.duration === 'string' ? parseInt(song.duration) || 0 : song.duration,
    };
    
    // 将所有排序后的歌曲作为播放列表
    const playlist: PlayerSong[] = sortedSongs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      image: s.albumCover,
      file_url: s.file_url || '', // 使用歌曲的真实file_url
      duration: typeof s.duration === 'string' ? parseInt(s.duration) || 0 : s.duration,
    }));
    
    // 找到当前歌曲在排序后播放列表中的索引
    const currentIndex = sortedSongs.findIndex(s => s.id === song.id);
    
    // 使用全局播放器播放歌曲
    await playSong(playerSong, playlist, currentIndex);
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

  // 处理专辑点击
  const handleAlbumPress = (album: AlbumType) => {
    console.log('打开专辑:', album.title);
  };

  // 处理艺术家点击
  const handleArtistPress = (artist: Artist) => {
    console.log('打开艺术家:', artist.name);
  };

  // 处理文件夹点击
  const handleFolderPress = (folder: Folder) => {
    console.log('打开文件夹:', folder.path);
  };

  // 渲染专辑项
  const renderAlbumItem = ({ item }: { item: AlbumType }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <TouchableRipple 
        onPress={() => handleAlbumPress(item)}
        style={styles.albumItem}
        borderless
      >
        <View>
          <Image source={{ uri: item.cover }} style={styles.albumCover} />
          <View style={styles.albumInfo}>
            <Text style={[styles.albumName, { color: spotifyColors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.albumArtist, { color: spotifyColors.inactive }]} numberOfLines={1}>
              {item.artist} • {item.songs.length}首歌曲
            </Text>
          </View>
        </View>
      </TouchableRipple>
    </MotiView>
  );

  // 渲染艺术家项
  const renderArtistItem = ({ item }: { item: Artist }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <TouchableRipple 
        onPress={() => handleArtistPress(item)}
        style={styles.artistItem}
        borderless
      >
        <View style={styles.artistContainer}>
          <View style={styles.artistImageContainer}>
            <Image source={{ uri: item.image }} style={styles.artistImage} />
            <LinearGradient
              colors={['rgba(29, 185, 84, 0.2)', 'rgba(0, 0, 0, 0)']}
              style={styles.artistImageGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          <Text style={[styles.artistName, { color: spotifyColors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.artistSongs, { color: spotifyColors.inactive }]}>
            {item.songs.length}首歌曲
          </Text>
        </View>
      </TouchableRipple>
    </MotiView>
  );

  // 渲染文件夹项
  const renderFolderItem = ({ item }: { item: Folder }) => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <TouchableRipple 
        onPress={() => handleFolderPress(item)}
        style={styles.folderItem}
        borderless
      >
        <View style={styles.folderContainer}>
          <IconButton 
            icon="folder" 
            size={36} 
            iconColor={spotifyColors.primary}
            style={{ margin: 0 }}
          />
          <View style={styles.folderInfo}>
            <Text style={[styles.folderName, { color: spotifyColors.text }]}>{item.name}</Text>
            <Text style={[styles.folderPath, { color: spotifyColors.inactive }]} numberOfLines={1}>
              {item.path}
            </Text>
          </View>
          <Text style={[styles.folderCount, { color: spotifyColors.inactive }]}>
            {item.count}
          </Text>
        </View>
      </TouchableRipple>
      <Divider style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
    </MotiView>
  );

  // 根据当前视图渲染内容
  const renderContent = () => {
    switch (currentView) {
      case 'songs':
        return (
          <SongList
            songs={sortedSongs}
            onSongPress={handleSongPress}
            backgroundColor={spotifyColors.background}
            textColor={spotifyColors.text}
            secondaryTextColor={spotifyColors.inactive}
            songListRef={songListRef}
          />
        );
      case 'albums':
        return (
          <View style={{ flex: 1, width: '100%' }}>
            <AlbumWall
              albums={albums}
            />
          </View>
        );
      case 'artists':
        return (
          <FlatList
            key="artists-grid-3-columns"
            data={artists}
            renderItem={renderArtistItem}
            keyExtractor={item => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={styles.artistsGrid}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, width: '100%' }}
            style={{ width: '100%' }}
          />
        );
      case 'folders':
        return (
          <FlatList
            key="folders-list-1-column"
            data={folders}
            renderItem={renderFolderItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        );
    }
  };

  // 获取当前视图的项目数量
  const getCurrentItemCount = () => {
    switch (currentView) {
      case 'songs':
        return sortedSongs.length;
      case 'albums':
        return albums.length;
      case 'artists':
        return artists.length;
      case 'folders':
        return folders.length;
    }
  };

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
        
        {/* 分类选项卡 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryTabsContainer}
          contentContainerStyle={styles.categoryTabs}
        >
          <TouchableRipple
            onPress={() => setCurrentView('songs')}
            style={[
              styles.categoryTab,
              currentView === 'songs' && styles.activeTab
            ]}
            rippleColor="rgba(29, 185, 84, 0.2)"
            borderless
          >
            <Text 
              style={[
                styles.tabText, 
                currentView === 'songs' && styles.activeTabText
              ]}
          >
            单曲
            </Text>
          </TouchableRipple>
          
          <TouchableRipple
            onPress={() => setCurrentView('albums')}
            style={[
              styles.categoryTab,
              currentView === 'albums' && styles.activeTab
            ]}
            rippleColor="rgba(29, 185, 84, 0.2)"
            borderless
          >
            <Text 
              style={[
                styles.tabText, 
                currentView === 'albums' && styles.activeTabText
              ]}
          >
            专辑
            </Text>
          </TouchableRipple>
          
          <TouchableRipple
            onPress={() => setCurrentView('artists')}
            style={[
              styles.categoryTab,
              currentView === 'artists' && styles.activeTab
            ]}
            rippleColor="rgba(29, 185, 84, 0.2)"
            borderless
          >
            <Text 
              style={[
                styles.tabText, 
                currentView === 'artists' && styles.activeTabText
              ]}
          >
            歌手
            </Text>
          </TouchableRipple>
          
          <TouchableRipple
            onPress={() => setCurrentView('folders')}
            style={[
              styles.categoryTab,
              currentView === 'folders' && styles.activeTab
            ]}
            rippleColor="rgba(29, 185, 84, 0.2)"
            borderless
          >
            <Text 
              style={[
                styles.tabText, 
                currentView === 'folders' && styles.activeTabText
              ]}
          >
            文件夹
            </Text>
          </TouchableRipple>
        </ScrollView>
        
        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: spotifyColors.inactive }]}>
            共 {getCurrentItemCount()} 个{
              currentView === 'songs' ? '单曲' : 
              currentView === 'albums' ? '专辑' : 
              currentView === 'artists' ? '歌手' : '文件夹'
            }
          </Text>
          {currentView === 'songs' && (
            <View style={styles.playButtonContainer}>
              <IconButton 
                icon="play-circle" 
                iconColor={spotifyColors.primary} 
                size={36} 
                onPress={() => {}} 
                style={styles.playButton}
              />
            </View>
          )}
        </View>
        
        {/* 替换ScrollView为View，避免嵌套VirtualizedLists */}
        <View style={{ flex: 1 }}>
          {renderContent()}
        </View>
        
        {/* 字母索引 - 只在单曲视图时显示 */}
        {currentView === 'songs' && (
          <AlphabetIndex
            onLetterPress={handleLetterPress}
            activeIndex={activeIndexLetter}
          />
        )}
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
  categoryTabsContainer: {
    flexGrow: 0,
    marginBottom: 20,
  },
  categoryTabs: {
    paddingRight: 16,
    paddingVertical: 4,
  },
  categoryTab: {
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: {
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
    borderColor: spotifyColors.primary,
  },
  tabText: {
    fontSize: 14,
    color: spotifyColors.inactive,
    fontWeight: '500',
  },
  activeTabText: {
    color: spotifyColors.primary,
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
  },
  albumsGrid: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  albumItem: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  albumCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  albumInfo: {
    marginTop: 8,
  },
  albumName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  albumArtist: {
    fontSize: 12,
    marginTop: 4,
  },
  artistsGrid: {
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  artistItem: {
    width: '30%',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  artistContainer: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  artistImageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  artistImage: {
    width: '85%',
    aspectRatio: 1,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  artistImageGradient: {
    position: 'absolute',
    top: 0,
    left: '7.5%',
    right: '7.5%',
    bottom: 0,
    borderRadius: 100,
    opacity: 0.7,
  },
  artistName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  artistSongs: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  folderItem: {
    marginBottom: 2,
  },
  folderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  folderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '500',
  },
  folderPath: {
    fontSize: 12,
    marginTop: 2,
  },
  folderCount: {
    fontSize: 14,
    marginLeft: 8,
  },
}); 