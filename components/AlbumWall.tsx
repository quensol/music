import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { IconButton } from 'react-native-paper';

import { Song as PlayerSong, usePlayer } from '@/contexts/PlayerContext';


// 专辑类型定义
export interface Album {
  id: number | string;
  title: string;
  artist: string;
  cover: string;
  songs: Song[];
}

// 歌曲类型定义
export interface Song {
  id: number | string;
  title: string;
  artist?: string;
  file_url: string;
  duration?: string;
}

// 组件属性类型
interface AlbumWallProps {
  albums: Album[];
  onSongSelect?: (album: Album, songIndex: number) => void;
}

// Spotify主题颜色
const spotifyColors = {
  primary: '#1DB954', // Spotify绿色
  background: '#121212', // 几乎黑色的背景
  card: '#181818', // 稍微亮一点的黑色
  text: '#FFFFFF',
  inactive: '#b3b3b3', // 灰色，用于非活跃项
};

// 获取屏幕尺寸
const { width: screenWidth } = Dimensions.get('window');

export default function AlbumWall({ albums, onSongSelect }: AlbumWallProps) {
  const router = useRouter();
  const { playSong, isFavorite, addToFavorites, removeFromFavorites } = usePlayer();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const albumGridScrollY = useRef(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const selectedAlbum = selectedAlbumId 
    ? albums.find(album => album.id.toString() === selectedAlbumId)
    : null;

  const currentAlbum = currentAlbumId
    ? albums.find(album => album.id.toString() === currentAlbumId)
    : null;

  const currentSong = currentAlbum && currentSongIndex !== null 
    ? currentAlbum.songs[currentSongIndex] 
    : null;

  // 播放音乐
  const playSound = async (album: Album, songIndex: number) => {
    // 如果有自定义处理函数，则使用它
    if (onSongSelect) {
      onSongSelect(album, songIndex);
      return;
    }

    // 使用全局播放器状态
    const song = album.songs[songIndex];
    if (!song || !song.file_url) return;
    
    // 转换歌曲格式以匹配PlayerContext
    const playerSong: PlayerSong = {
      id: song.id,
      title: song.title,
      artist: song.artist || album.artist,
      album: album.title,
      image: album.cover,
      file_url: song.file_url,
      duration: typeof song.duration === 'string' ? parseInt(song.duration) || 0 : song.duration,
    };
    
    // 转换整个专辑的歌曲列表
    const playlist: PlayerSong[] = album.songs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist || album.artist,
      album: album.title,
      image: album.cover,
      file_url: s.file_url,
      duration: typeof s.duration === 'string' ? parseInt(s.duration) || 0 : s.duration,
    }));
    
    // 使用全局播放器播放歌曲
    playSong(playerSong, playlist, songIndex);
    
    // 更新本地状态以保持UI同步
    setCurrentAlbumId(album.id.toString());
    setCurrentSongIndex(songIndex);
  };

  // 组件卸载时清理资源（现在由AudioService单例管理）
  useEffect(() => {
    return () => {
      // 清理工作现在由AudioService单例处理
    };
  }, []);

  // 处理专辑点击
  const handleAlbumClick = (album: Album) => {
    if (isAnimating) return;
    
    // 记录当前滚动位置
    if (flatListRef.current) {
      albumGridScrollY.current = flatListRef.current.props.contentOffset?.y || 0;
    }
    
    setIsAnimating(true);
    
    // 淡出动画
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSelectedAlbumId(album.id.toString());
      
      // 淡入动画
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        delay: 100,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };

  // 处理返回操作
  const handleBack = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // 淡出动画
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSelectedAlbumId(null);
      
      // 淡入动画
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        delay: 100,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
        
        // 恢复之前的滚动位置
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ 
            offset: albumGridScrollY.current,
            animated: false 
          });
        }
      });
    });
  };

  // 切换播放/暂停
  const togglePlayPause = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  // 切换到上一首
  const handlePrevSong = () => {
    if (!currentAlbum || currentSongIndex === null) return;
    
    // 如果是第一首歌，切换到最后一首
    const newIndex = currentSongIndex === 0 
      ? currentAlbum.songs.length - 1 
      : currentSongIndex - 1;
    
    playSound(currentAlbum, newIndex);
  };

  // 切换到下一首
  const handleNextSong = () => {
    if (!currentAlbum || currentSongIndex === null) return;
    
    // 如果是最后一首歌，切换到第一首
    const newIndex = currentSongIndex === currentAlbum.songs.length - 1 
      ? 0 
      : currentSongIndex + 1;
    
    playSound(currentAlbum, newIndex);
  };

  // 渲染专辑列表
  const renderAlbumGrid = () => {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <FlatList
          ref={flatListRef}
          data={albums}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.albumItem}
              onPress={() => handleAlbumClick(item)}
              activeOpacity={0.7}
            >
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'timing',
                  duration: 500,
                  delay: index * 50
                }}
                style={styles.albumContainer}
              >
                <Image
                  source={{ uri: item.cover }}
                  style={styles.albumCover}
                />
                <View style={styles.albumOverlay} />
                <View style={styles.albumInfo}>
                  <Text style={styles.albumTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.albumArtist} numberOfLines={1}>
                    {item.artist}
                  </Text>
                </View>
              </MotiView>
            </TouchableOpacity>
          )}
          numColumns={2}
          key="album-grid-2-columns"
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    );
  };

  // 渲染专辑详情
  const renderAlbumDetail = () => {
    if (!selectedAlbum) return null;

    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* 固定在顶部的半透明导航栏 */}
        <View style={styles.fixedHeader}>
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor="#fff"
            style={styles.headerBackButton}
              onPress={handleBack}
            />
          <Animated.Text 
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {selectedAlbum.title}
          </Animated.Text>
          </View>

          <FlatList
            data={selectedAlbum.songs}
          key="album-detail-1-column"
            renderItem={({ item, index }) => {
              const isPlaying = 
                currentAlbumId === selectedAlbum.id.toString() && 
                currentSongIndex === index;
              
              return (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'timing',
                    duration: 500,
                    delay: index * 50
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.songItem,
                      isPlaying && styles.activeSongItem
                    ]}
                    onPress={() => playSound(selectedAlbum, index)}
                  >
                    <View style={styles.songNumberContainer}>
                      <Text style={[
                        styles.songNumber,
                        isPlaying && styles.activeSongText
                      ]}>
                        {index + 1}
                      </Text>
                    </View>
                    
                    <View style={styles.songInfo}>
                      <Text 
                        style={[
                          styles.songTitle,
                          isPlaying && styles.activeSongText
                        ]} 
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {item.duration && (
                        <Text 
                          style={[
                            styles.songDuration,
                            isPlaying && styles.activeSongDuration
                          ]}
                        >
                          {item.duration}
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.songActions}>
                      <IconButton
                        icon={isFavorite(item.id) ? "heart" : "heart-outline"}
                        iconColor={isFavorite(item.id) ? spotifyColors.primary : spotifyColors.inactive}
                        size={20}
                        onPress={(e) => {
                          e.stopPropagation();
                          const playerSong = {
                            id: item.id,
                            title: item.title,
                            artist: item.artist || selectedAlbum.artist,
                            album: selectedAlbum.title,
                            image: selectedAlbum.cover,
                            file_url: item.file_url,
                            duration: typeof item.duration === 'string' ? parseInt(item.duration) || 0 : item.duration,
                          };
                          
                          if (isFavorite(item.id)) {
                            removeFromFavorites(item.id);
                          } else {
                            addToFavorites(playerSong);
                          }
                        }}
                      />
                      {isPlaying && (
                        <IconButton
                          icon={isPlaying ? "pause" : "play"}
                          size={20}
                          iconColor={spotifyColors.primary}
                          onPress={(e) => {
                            e.stopPropagation();
                            togglePlayPause();
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            }}
            keyExtractor={(item, index) => `${selectedAlbum.id}-song-${index}`}
            contentContainerStyle={styles.songsList}
            showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            function AlbumHeader() {
              return (
                <>
                  {/* 封面区域 - 不需要返回按钮 */}
                  <View style={styles.coverContainer}>
                    <Image
                      source={{ uri: selectedAlbum.cover }}
                      style={styles.detailCover}
                    />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']}
                      style={styles.gradientOverlay}
                    />
                  </View>

                  {/* 专辑信息 */}
                  <View style={styles.albumHeader}>
                    <Text style={styles.detailTitle}>{selectedAlbum.title}</Text>
                    <Text style={styles.detailArtist}>{selectedAlbum.artist}</Text>
                  </View>
                </>
              );
            }
          }
        />
      </Animated.View>
    );
  };

  // 渲染迷你播放器
  const renderMiniPlayer = () => {
    if (!currentSong || !currentAlbum) return null;

    return (
      <View style={styles.miniPlayerContainer}>
        <TouchableOpacity 
          style={styles.miniPlayer}
          onPress={() => {
            if (currentAlbumId && currentAlbumId !== selectedAlbumId) {
              const album = albums.find(a => a.id.toString() === currentAlbumId);
              if (album) {
                handleAlbumClick(album);
              }
            }
          }}
        >
          <Image
            source={{ uri: currentAlbum.cover }}
            style={styles.miniPlayerCover}
          />
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>
              {currentSong.title}
            </Text>
            <Text style={styles.miniPlayerArtist} numberOfLines={1}>
              {currentAlbum.artist}
            </Text>
          </View>
          <View style={styles.miniPlayerControls}>
            <IconButton
              icon={isPlaying ? "pause" : "play"}
              size={24}
              iconColor={spotifyColors.primary}
              onPress={togglePlayPause}
            />
            <IconButton
              icon="skip-next"
              size={24}
              iconColor="#fff"
              onPress={handleNextSong}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      
      {/* 根据选中状态显示不同的视图 */}
      {selectedAlbum ? renderAlbumDetail() : renderAlbumGrid()}
      
      {/* 迷你播放器 */}
      {currentSong && renderMiniPlayer()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: spotifyColors.background,
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  gridContainer: {
    padding: 4,
    paddingBottom: 100, // 为底部播放器留出空间（播放器高度增加到80px）
  },
  albumItem: {
    width: '50%', // 使用百分比而不是固定宽度
    aspectRatio: 1,
    padding: 4,
  },
  albumContainer: {
    flex: 1,
    position: 'relative',
  },
  albumCover: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  albumOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
  },
  albumInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  albumTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  albumArtist: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // 专辑详情样式
  detailContainer: {
    flex: 1,
  },
  coverContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // 将宽高比改回1:1
    marginTop: 0,
    paddingHorizontal: 0, // 移除水平内边距
  },
  detailCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  albumHeader: {
    padding: 16,
    paddingTop: 10,
    paddingHorizontal: 8, // 减小水平内边距
  },
  detailTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailArtist: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  songsList: {
    paddingHorizontal: 8,
    paddingBottom: 100, // 为底部播放器留出空间（播放器高度增加到80px）
    paddingTop: 60, // 为顶部导航栏留出空间
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  activeSongItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  songNumberContainer: {
    width: 30,
    alignItems: 'center',
  },
  songNumber: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
  },
  songDuration: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 4,
  },
  activeSongText: {
    color: spotifyColors.primary,
    fontWeight: 'bold',
  },
  activeSongDuration: {
    color: 'rgba(255,255,255,0.7)',
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  playingIndicator: {
    marginLeft: 10,
  },
  // 迷你播放器样式
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 0, // 固定在屏幕最底部，因为导航栏现在在顶部
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: spotifyColors.card,
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  miniPlayerCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  miniPlayerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  miniPlayerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  miniPlayerArtist: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  miniPlayerControls: {
    flexDirection: 'row',
  },
  // 新增固定顶部导航栏样式
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: spotifyColors.background, // 使用纯色背景
    zIndex: 100,
    elevation: 5,
  },
  headerBackButton: {
    margin: 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
}); 