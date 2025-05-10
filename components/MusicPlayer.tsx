import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

// Spotify主题颜色
const spotifyColors = {
  primary: '#1DB954', // Spotify绿色
  background: '#121212', // 几乎黑色的背景
  card: '#181818', // 稍微亮一点的黑色
  text: '#FFFFFF',
  inactive: '#b3b3b3', // 灰色，用于非活跃项
};

// 迷你播放器（底部固定）
export const MiniPlayer = ({ onExpand, song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  if (!song) return null;
  
  return (
    <MotiView
      from={{ translateY: 80 }}
      animate={{ translateY: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      style={[styles.miniPlayer, { backgroundColor: spotifyColors.card }]}
    >
      <TouchableOpacity style={styles.miniPlayerContent} onPress={onExpand}>
        <Image source={{ uri: song.image }} style={styles.miniPlayerImage} />
        <View style={styles.miniPlayerInfo}>
          <Text style={{ color: spotifyColors.text, fontWeight: 'bold' }} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={{ color: spotifyColors.inactive }} numberOfLines={1}>
            {song.artist}
          </Text>
        </View>
        <View style={styles.miniPlayerControls}>
          <IconButton
            icon="heart-outline"
            iconColor={spotifyColors.inactive}
            size={24}
            onPress={() => {}}
          />
          <IconButton
            icon={isPlaying ? "pause" : "play"}
            iconColor={spotifyColors.text}
            size={24}
            style={{ backgroundColor: spotifyColors.primary, margin: 0 }}
            onPress={() => setIsPlaying(!isPlaying)}
          />
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};

// 全屏播放器
export const FullScreenPlayer = ({ onCollapse, song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: 不重复, 1: 重复全部, 2: 重复当前
  const [progress, setProgress] = useState(0.3); // 播放进度，0-1之间
  
  if (!song) return null;
  
  // 格式化时间
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };
  
  // 当前播放时间
  const currentTime = formatTime(progress * song.duration);
  // 总时长
  const totalTime = formatTime(song.duration);
  
  // 循环模式切换
  const toggleRepeatMode = () => {
    setRepeatMode((repeatMode + 1) % 3);
  };
  
  // 获取重复图标
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 1: return "repeat";
      case 2: return "repeat-once";
      default: return "repeat-off";
    }
  };
  
  return (
    <MotiView
      from={{ translateY: Dimensions.get('window').height }}
      animate={{ translateY: 0 }}
      exit={{ translateY: Dimensions.get('window').height }}
      transition={{ type: 'timing', duration: 300 }}
      style={styles.fullScreenPlayer}
    >
      <LinearGradient
        colors={['#424242', spotifyColors.background]}
        style={styles.fullScreenGradient}
      >
        {/* 顶部导航栏 */}
        <View style={styles.playerHeader}>
          <IconButton
            icon="chevron-down"
            iconColor={spotifyColors.text}
            size={28}
            onPress={onCollapse}
          />
          <Text style={styles.playerTitle}>正在播放</Text>
          <IconButton
            icon="dots-horizontal"
            iconColor={spotifyColors.text}
            size={28}
            onPress={() => {}}
          />
        </View>
        
        {/* 封面图 */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: song.image }} style={styles.coverImage} />
        </View>
        
        {/* 歌曲信息 */}
        <View style={styles.songInfoContainer}>
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{song.title}</Text>
            <Text style={styles.artistName}>{song.artist}</Text>
          </View>
          <IconButton
            icon="heart-outline"
            iconColor={spotifyColors.inactive}
            size={26}
            onPress={() => {}}
          />
        </View>
        
        {/* 进度条 */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            onValueChange={setProgress}
            minimumTrackTintColor={spotifyColors.primary}
            maximumTrackTintColor={spotifyColors.inactive}
            thumbTintColor={spotifyColors.text}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{currentTime}</Text>
            <Text style={styles.timeText}>{totalTime}</Text>
          </View>
        </View>
        
        {/* 控制按钮 */}
        <View style={styles.controlsContainer}>
          <IconButton
            icon={isShuffle ? "shuffle-variant" : "shuffle-disabled"}
            iconColor={isShuffle ? spotifyColors.primary : spotifyColors.inactive}
            size={26}
            onPress={() => setIsShuffle(!isShuffle)}
          />
          <IconButton
            icon="skip-previous"
            iconColor={spotifyColors.text}
            size={40}
            onPress={() => {}}
          />
          <IconButton
            icon={isPlaying ? "pause-circle" : "play-circle"}
            iconColor={spotifyColors.text}
            size={64}
            onPress={() => setIsPlaying(!isPlaying)}
          />
          <IconButton
            icon="skip-next"
            iconColor={spotifyColors.text}
            size={40}
            onPress={() => {}}
          />
          <IconButton
            icon={getRepeatIcon()}
            iconColor={repeatMode > 0 ? spotifyColors.primary : spotifyColors.inactive}
            size={26}
            onPress={toggleRepeatMode}
          />
        </View>
        
        {/* 底部额外功能 */}
        <View style={styles.extraControlsContainer}>
          <IconButton
            icon="cast"
            iconColor={spotifyColors.inactive}
            size={22}
            onPress={() => {}}
          />
          <IconButton
            icon="playlist-music"
            iconColor={spotifyColors.inactive}
            size={22}
            onPress={() => {}}
          />
        </View>
      </LinearGradient>
    </MotiView>
  );
};

// 默认导出的播放器组件
export default function MusicPlayer() {
  const [expanded, setExpanded] = useState(false);
  
  // 当前歌曲示例数据
  const currentSong = {
    id: 1,
    title: "晴天",
    artist: "周杰伦",
    album: "叶惠美",
    image: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
    duration: 269, // 歌曲长度（秒）
  };
  
  return (
    <>
      {/* 迷你播放器 - 始终显示在底部 */}
      {!expanded && (
        <MiniPlayer 
          song={currentSong} 
          onExpand={() => setExpanded(true)} 
        />
      )}
      
      {/* 全屏播放器 - 展开时显示 */}
      {expanded && (
        <FullScreenPlayer 
          song={currentSong} 
          onCollapse={() => setExpanded(false)} 
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // 迷你播放器样式
  miniPlayer: {
    position: 'absolute',
    bottom: 50, // 为底部标签导航留出空间
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#333',
    zIndex: 10,
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: '100%',
  },
  miniPlayerImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // 全屏播放器样式
  fullScreenPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  fullScreenGradient: {
    flex: 1,
    paddingTop: 40, // 状态栏高度
    paddingHorizontal: 16,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  playerTitle: {
    color: spotifyColors.text,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  coverImage: {
    width: 300,
    height: 300,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  songInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: spotifyColors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistName: {
    color: spotifyColors.inactive,
    fontSize: 16,
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 40,
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    color: spotifyColors.inactive,
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  extraControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginHorizontal: 40,
  },
}); 