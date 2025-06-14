import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { IconButton } from 'react-native-paper';

import { Playlist, getPlaylistById } from '@/config/playlists';
import { Song as PlayerSong, usePlayer } from '@/contexts/PlayerContext';

// Spotify主题颜色
const spotifyColors = {
  primary: '#1DB954',
  background: '#121212',
  card: '#181818',
  text: '#FFFFFF',
  inactive: '#b3b3b3',
};

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { playSong, recentlyPlayed, getRecentlyPlayed } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (id) {
      // 如果是最近播放歌单，需要传入最近播放的歌曲
      if (id === 'recently-played') {
        const recentSongs = getRecentlyPlayed();
        const playlistData = getPlaylistById(id, recentSongs);
        setPlaylist(playlistData);
      } else {
        const playlistData = getPlaylistById(id);
        setPlaylist(playlistData);
      }
    }
  }, [id, recentlyPlayed]); // 添加recentlyPlayed依赖

  // 播放歌曲
  const playSound = async (songIndex: number) => {
    if (!playlist) return;
    
    const song = playlist.songs[songIndex];
    if (!song || !song.file_url) return;
    
    // 转换歌曲格式以匹配PlayerContext
    const playerSong: PlayerSong = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album || playlist.name,
      image: song.albumCover || playlist.image,
      file_url: song.file_url,
      duration: typeof song.duration === 'string' ? parseInt(song.duration.replace(':', '')) || 0 : song.duration,
    };
    
    // 转换整个歌单的歌曲列表
    const playlistSongs: PlayerSong[] = playlist.songs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album || playlist.name,
      image: s.albumCover || playlist.image,
      file_url: s.file_url,
      duration: typeof s.duration === 'string' ? parseInt(s.duration.replace(':', '')) || 0 : s.duration,
    }));
    
    // 使用全局播放器播放歌曲
    playSong(playerSong, playlistSongs, songIndex);
    
    // 更新本地状态
    setCurrentSongIndex(songIndex);
    setIsPlaying(true);
  };

  // 处理返回
  const handleBack = () => {
    router.back();
  };

  // 播放全部歌曲
  const playAll = () => {
    if (playlist && playlist.songs.length > 0) {
      playSound(0);
    }
  };

  // 随机播放
  const shufflePlay = () => {
    if (playlist && playlist.songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlist.songs.length);
      playSound(randomIndex);
    }
  };

  if (!playlist) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.text, { color: spotifyColors.text }]}>歌单不存在</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* 固定顶部导航栏 */}
      <View style={styles.fixedHeader}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#fff"
          style={styles.headerBackButton}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {playlist.name}
        </Text>
        <IconButton
          icon="dots-vertical"
          size={24}
          iconColor="#fff"
          style={styles.headerMenuButton}
          onPress={() => {}}
        />
      </View>

      <FlatList
        data={playlist.songs}
        renderItem={({ item, index }) => {
          const isCurrentSong = currentSongIndex === index;
          
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
                  isCurrentSong && styles.activeSongItem
                ]}
                onPress={() => playSound(index)}
              >
                <Image
                  source={{ uri: item.albumCover || playlist.image }}
                  style={styles.songCover}
                />
                
                <View style={styles.songInfo}>
                  <Text 
                    style={[
                      styles.songTitle,
                      isCurrentSong && styles.activeSongText
                    ]} 
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text 
                    style={[
                      styles.songArtist,
                      isCurrentSong && styles.activeSongArtist
                    ]}
                    numberOfLines={1}
                  >
                    {item.artist}
                  </Text>
                </View>
                
                <View style={styles.songMeta}>
                  {item.duration && (
                    <Text 
                      style={[
                        styles.songDuration,
                        isCurrentSong && styles.activeSongDuration
                      ]}
                    >
                      {item.duration}
                    </Text>
                  )}
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    iconColor={spotifyColors.inactive}
                    onPress={() => {}}
                  />
                </View>
              </TouchableOpacity>
            </MotiView>
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.songsList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* 歌单封面和信息 */}
            <View style={styles.playlistHeader}>
              <Image
                source={{ uri: playlist.image }}
                style={styles.playlistCover}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']}
                style={styles.gradientOverlay}
              />
              
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <Text style={styles.playlistDescription}>{playlist.description}</Text>
                {playlist.createdAt && (
                  <Text style={styles.playlistMeta}>
                    创建于 {playlist.createdAt}
                  </Text>
                )}
              </View>
            </View>

            {/* 播放控制按钮 */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.playButton} onPress={playAll}>
                <IconButton
                  icon="play"
                  size={20}
                  iconColor="#000"
                  style={{ margin: 0 }}
                />
                <Text style={styles.playButtonText}>播放全部</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shuffleButton} onPress={shufflePlay}>
                <IconButton
                  icon="shuffle"
                  size={20}
                  iconColor={spotifyColors.text}
                  style={{ margin: 0 }}
                />
                <Text style={styles.shuffleButtonText}>随机播放</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: spotifyColors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    zIndex: 1000,
  },
  headerBackButton: {
    margin: 0,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerMenuButton: {
    margin: 0,
  },
  playlistHeader: {
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 140,
    paddingBottom: 30,
  },
  playlistCover: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playlistInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 20,
  },
  playlistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: spotifyColors.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  playlistDescription: {
    fontSize: 16,
    color: spotifyColors.inactive,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
  },
  playlistMeta: {
    fontSize: 14,
    color: spotifyColors.inactive,
    textAlign: 'center',
    lineHeight: 18,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 10,
    gap: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: spotifyColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 120,
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: spotifyColors.inactive,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 120,
    justifyContent: 'center',
  },
  shuffleButtonText: {
    color: spotifyColors.text,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  songsList: {
    paddingBottom: 100,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  activeSongItem: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  songCover: {
    width: 56,
    height: 56,
    borderRadius: 6,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: spotifyColors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  activeSongText: {
    color: spotifyColors.primary,
  },
  songArtist: {
    fontSize: 14,
    color: spotifyColors.inactive,
    lineHeight: 18,
  },
  activeSongArtist: {
    color: spotifyColors.primary,
  },
  songMeta: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  songDuration: {
    fontSize: 14,
    color: spotifyColors.inactive,
    marginBottom: 4,
    textAlign: 'center',
  },
  activeSongDuration: {
    color: spotifyColors.primary,
  },
}); 