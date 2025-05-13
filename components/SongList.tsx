import { MotiView } from 'moti';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Divider, Text, TouchableRipple } from 'react-native-paper';

// 歌曲数据接口
export interface Song {
  id: string | number;
  title: string;
  artist: string;
  duration: string;
  albumCover: string;
}

interface SongListProps {
  songs: Song[];
  onSongPress?: (song: Song) => void;
  backgroundColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
}

// Spotify主题颜色
const defaultColors = {
  background: '#121212', // 几乎黑色的背景
  text: '#FFFFFF',
  inactive: '#b3b3b3', // 灰色，用于非活跃项
};

const SongList: React.FC<SongListProps> = ({
  songs,
  onSongPress,
  backgroundColor = defaultColors.background,
  textColor = defaultColors.text,
  secondaryTextColor = defaultColors.inactive,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {songs.map((song, index) => (
        <MotiView
          key={song.id}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 300,
            delay: index * 50
          }}
        >
          <View style={styles.songItemContainer}>
            <TouchableRipple
              onPress={() => onSongPress && onSongPress(song)}
              rippleColor="rgba(255, 255, 255, 0.2)"
              style={styles.ripple}
              borderless
            >
              <View style={styles.songItem}>
                <Image source={{ uri: song.albumCover }} style={styles.albumCover} />
                <View style={styles.songInfo}>
                  <Text style={[styles.songTitle, { color: textColor }]} numberOfLines={1}>
                    {song.title}
                  </Text>
                  <Text style={[styles.artistName, { color: secondaryTextColor }]} numberOfLines={1}>
                    {song.artist}
                  </Text>
                </View>
                <Text style={[styles.duration, { color: secondaryTextColor }]}>
                  {song.duration}
                </Text>
              </View>
            </TouchableRipple>
          </View>
          {index < songs.length - 1 && (
            <Divider style={[styles.divider, { backgroundColor: secondaryTextColor }]} />
          )}
        </MotiView>
      ))}
    </View>
  );
};

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
  duration: {
    fontSize: 14,
    marginLeft: 10,
  },
  divider: {
    opacity: 0.1,
    marginLeft: 78, // 与专辑封面右边对齐
  },
});

export default SongList; 