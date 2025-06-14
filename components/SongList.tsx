import { usePlayer } from '@/contexts/PlayerContext';
import { MotiView } from 'moti';
import React, { forwardRef } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Divider, IconButton, Text, TouchableRipple } from 'react-native-paper';

// 歌曲数据接口
export interface Song {
  id: string | number;
  title: string;
  artist: string;
  album?: string; // 添加专辑字段，设为可选
  duration: string;
  albumCover: string;
  file_url?: string; // 添加文件URL字段
}

interface SongListProps {
  songs: Song[];
  onSongPress?: (song: Song) => void;
  backgroundColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  showDividers?: boolean;
  contentContainerStyle?: object;
  songListRef?: React.RefObject<FlatList | null>;
}

// Spotify主题颜色
const defaultColors = {
  background: '#121212', // 几乎黑色的背景
  text: '#FFFFFF',
  inactive: '#b3b3b3', // 灰色，用于非活跃项
  primary: '#1DB954', // Spotify绿色
};

const SongList = forwardRef<FlatList, SongListProps>(({
  songs,
  onSongPress,
  backgroundColor = defaultColors.background,
  textColor = defaultColors.text,
  secondaryTextColor = defaultColors.inactive,
  showDividers = true,
  contentContainerStyle,
  songListRef,
}, ref) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = usePlayer();

  // 处理收藏切换
  const handleToggleFavorite = (song: Song) => {
    if (isFavorite(song.id)) {
      removeFromFavorites(song.id);
    } else {
      // 转换为播放器需要的格式
      const playerSong = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        image: song.albumCover,
        file_url: song.file_url || '',
        duration: song.duration,
      };
      addToFavorites(playerSong);
    }
  };

  const renderItem = ({ item, index }: { item: Song; index: number }) => (
        <MotiView
      key={item.id}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 300,
        delay: index * 50 > 1000 ? 0 : index * 50 // 限制最大延迟为1000ms
          }}
        >
          <View style={styles.songItemContainer}>
            <TouchableRipple
          onPress={() => onSongPress && onSongPress(item)}
              rippleColor="rgba(255, 255, 255, 0.2)"
              style={styles.ripple}
              borderless
            >
              <View style={styles.songItem}>
            <Image source={{ uri: item.albumCover }} style={styles.albumCover} />
                <View style={styles.songInfo}>
                  <Text style={[styles.songTitle, { color: textColor }]} numberOfLines={1}>
                {item.title}
                  </Text>
                  <Text style={[styles.artistName, { color: secondaryTextColor }]} numberOfLines={1}>
                {item.artist}{item.album ? ` • ${item.album}` : ''}
                  </Text>
                </View>
                <View style={styles.songActions}>
                  <Text style={[styles.duration, { color: secondaryTextColor }]}>
                    {item.duration}
                  </Text>
                  <IconButton
                    icon={isFavorite(item.id) ? "heart" : "heart-outline"}
                    iconColor={isFavorite(item.id) ? defaultColors.primary : secondaryTextColor}
                    size={20}
                    onPress={() => handleToggleFavorite(item)}
                  />
                </View>
              </View>
            </TouchableRipple>
          </View>
      {showDividers && index < songs.length - 1 && (
        <Divider style={[styles.divider, { backgroundColor: secondaryTextColor, opacity: 0.1 }]} />
          )}
        </MotiView>
  );

  return (
    <FlatList
      ref={ref || songListRef}
      data={songs}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      showsVerticalScrollIndicator={false}
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={[{ paddingBottom: 100 }, contentContainerStyle]}
      getItemLayout={(data, index) => ({
        length: 72, // 估算的每个item高度
        offset: 72 * index,
        index,
      })}
      onScrollToIndexFailed={(info) => {
        // 处理滚动失败的情况
        console.warn('Scroll to index failed:', info);
      }}
    />
  );
});

SongList.displayName = 'SongList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  songItemContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 2,
  },
  ripple: {
    borderRadius: 8,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  albumCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  artistName: {
    fontSize: 14,
    marginTop: 2,
  },
  songActions: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  duration: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  divider: {
    marginLeft: 78, // 与专辑封面右边对齐
  },
});

export default SongList; 