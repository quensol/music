import { usePlayer } from '@/contexts/PlayerContext';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { IconButton, Text, TouchableRipple } from 'react-native-paper';

// Spotify主题颜色
const spotifyColors = {
  primary: '#1DB954',
  background: '#121212',
  card: '#181818',
  text: '#FFFFFF',
  inactive: '#b3b3b3',
};

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoritesSongs, playSong, removeFromFavorites, playerState } = usePlayer();
  const [isNavigating, setIsNavigating] = useState(false);

  // 处理返回
  const handleBack = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.back();
    setTimeout(() => setIsNavigating(false), 1000);
  };

  // 播放歌曲
  const handleSongPress = async (songIndex: number) => {
    const song = favoritesSongs[songIndex];
    if (!song || !song.file_url) return;
    
    // 使用收藏列表作为播放列表
    await playSong(song, favoritesSongs, songIndex);
  };

  // 移除收藏
  const handleRemoveFavorite = (songId: string | number) => {
    removeFromFavorites(songId);
  };

  // 渲染歌曲项
  const renderSongItem = ({ item, index }: { item: any; index: number }) => {
    const isCurrentSong = playerState.currentSong?.id === item.id;
    
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
        <TouchableRipple
          style={[
            styles.songItem,
            isCurrentSong && styles.activeSongItem
          ]}
          onPress={() => handleSongPress(index)}
          rippleColor="rgba(255, 255, 255, 0.2)"
        >
          <View style={styles.songContent}>
            <Image
              source={{ uri: item.image }}
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
            
            <View style={styles.songActions}>
              {item.duration && (
                <Text 
                  style={[
                    styles.songDuration,
                    isCurrentSong && styles.activeSongDuration
                  ]}
                >
                  {typeof item.duration === 'number' 
                    ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}`
                    : item.duration
                  }
                </Text>
              )}
              <IconButton
                icon="heart"
                iconColor={spotifyColors.primary}
                size={20}
                onPress={() => handleRemoveFavorite(item.id)}
              />
            </View>
          </View>
        </TouchableRipple>
      </MotiView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: spotifyColors.background }]}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={spotifyColors.text}
          onPress={handleBack}
          disabled={isNavigating}
        />
        <Text style={[styles.title, { color: spotifyColors.text }]}>我的收藏</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* 收藏统计 */}
      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: spotifyColors.inactive }]}>
          {favoritesSongs.length} 首歌曲
        </Text>
      </View>

      {/* 歌曲列表 */}
      {favoritesSongs.length > 0 ? (
        <FlatList
          data={favoritesSongs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.songsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <IconButton
            icon="heart-outline"
            size={64}
            iconColor={spotifyColors.inactive}
          />
          <Text style={[styles.emptyTitle, { color: spotifyColors.text }]}>
            还没有收藏的歌曲
          </Text>
          <Text style={[styles.emptySubtitle, { color: spotifyColors.inactive }]}>
            点击歌曲旁边的爱心来收藏你喜欢的音乐
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsText: {
    fontSize: 14,
  },
  songsList: {
    paddingBottom: 100,
  },
  songItem: {
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  activeSongItem: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  songContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  songActions: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 