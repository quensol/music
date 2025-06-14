import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { LyricLine, usePlayer } from '@/contexts/PlayerContext';


// Spotify主题颜色
const spotifyColors = {
  primary: '#1DB954', // Spotify绿色
  background: '#121212', // 几乎黑色的背景
  card: '#181818', // 稍微亮一点的黑色
  text: '#FFFFFF',
  inactive: '#b3b3b3', // 灰色，用于非活跃项
};

// 获取屏幕尺寸以适配不同设备
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');



// 迷你播放器（底部固定）
export const MiniPlayer = ({ onExpand }: { onExpand: () => void }) => {
  const { playerState, togglePlayPause, isFavorite, addToFavorites, removeFromFavorites } = usePlayer();
  const [isToggling, setIsToggling] = useState(false);
  
  // 监听播放状态变化
  useEffect(() => {
    console.log('MiniPlayer: playerState updated:', {
      isPlaying: playerState.isPlaying,
      currentSong: playerState.currentSong?.title
    });
  }, [playerState.isPlaying, playerState.currentSong]);
  
  if (!playerState.currentSong) return null;
  
  const song = playerState.currentSong;
  
  const handleTogglePlayPause = async () => {
    setIsToggling(true);
    try {
      await togglePlayPause();
    } catch (error) {
      console.error('MiniPlayer: Error in togglePlayPause:', error);
    }
    // 添加短暂延迟以显示视觉反馈
    setTimeout(() => setIsToggling(false), 200);
  };

  const handleToggleFavorite = () => {
    if (!song) return;
    
    if (isFavorite(song.id)) {
      removeFromFavorites(song.id);
    } else {
      addToFavorites(song);
    }
  };
  
  return (
    <MotiView
      from={{ translateY: 80 }}
      animate={{ translateY: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      style={[styles.miniPlayer, { backgroundColor: spotifyColors.card }]}
    >
      <View style={styles.miniPlayerContent}>
        <TouchableOpacity style={styles.miniPlayerMainArea} onPress={onExpand}>
          <View style={styles.miniImageContainer}>
            <Image source={{ uri: song.image }} style={styles.miniPlayerImage} />
            {playerState.isPlaying && (
              <View style={styles.miniPlayingIndicator}>
                <View style={styles.miniPlayingDot} />
              </View>
            )}
          </View>
          <View style={styles.miniPlayerInfo}>
            <Text style={{ color: spotifyColors.text, fontWeight: 'bold' }} numberOfLines={1}>
              {song.title}
            </Text>
            <Text style={{ color: spotifyColors.inactive }} numberOfLines={1}>
              {song.artist}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.miniPlayerControls}>
          <IconButton
            icon={isFavorite(song.id) ? "heart" : "heart-outline"}
            iconColor={isFavorite(song.id) ? spotifyColors.primary : spotifyColors.inactive}
            size={24}
            onPress={handleToggleFavorite}
          />
          <TouchableOpacity
            onPress={handleTogglePlayPause}
            style={[
              styles.miniPlayButton,
              { 
                backgroundColor: isToggling ? spotifyColors.inactive : spotifyColors.primary,
                opacity: isToggling ? 0.7 : 1,
                width: 44,
                height: 44,
                borderRadius: 22,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }
            ]}
            activeOpacity={0.8}
            disabled={false}
          >
            <Ionicons 
              name={playerState.isPlaying ? "pause" : "play"} 
              size={20} 
              color={spotifyColors.background} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </MotiView>
  );
};

// 全屏播放器
export const FullScreenPlayer = ({ onCollapse }: { onCollapse: () => void }) => {
  const { playerState, togglePlayPause, playNext, playPrevious, setPosition, isFavorite, addToFavorites, removeFromFavorites } = usePlayer();
  const [repeatMode, setRepeatMode] = useState(0); // 0: 不重复, 1: 重复全部, 2: 重复当前, 3: 随机播放
  const [showLyrics, setShowLyrics] = useState(false); // 是否显示歌词
  const [isDownloaded, setIsDownloaded] = useState(false); // 是否已下载
  const [timerActive, setTimerActive] = useState(false); // 定时器是否激活
  const [isToggling, setIsToggling] = useState(false);
  
  if (!playerState.currentSong) return null;
  
  const song = playerState.currentSong;
  
  // 格式化时间（毫秒转换为秒）
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };
  
  // 计算进度（0-1之间）
  const actualProgress = playerState.duration > 0 ? playerState.currentTime / playerState.duration : 0;
  const progress = isDragging ? dragValue : actualProgress;
  
  // 当前播放时间和总时长
  const currentTime = formatTime(isDragging ? dragValue * playerState.duration : playerState.currentTime);
  const totalTime = formatTime(playerState.duration);
  
  // 处理进度条拖拽
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const handleProgressChange = (value: number) => {
    setDragValue(value);
  };

  const handleProgressStart = () => {
    setIsDragging(true);
  };

  const handleProgressComplete = async (value: number) => {
    setIsDragging(false);
    const newTime = value * playerState.duration;
    await setPosition(newTime);
  };
  
  // 循环模式切换
  const toggleRepeatMode = () => {
    setRepeatMode((repeatMode + 1) % 4); // 现在有4种状态
  };
  
  // 获取重复图标
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 1: return "repeat";
      case 2: return "repeat-once";
      case 3: return "shuffle-variant";
      default: return "repeat-off";
    }
  };
  
  // 获取图标颜色
  const getRepeatIconColor = () => {
    return repeatMode > 0 ? spotifyColors.primary : spotifyColors.inactive;
  };
  
  // 当前时间点（秒）
  const currentTimeInSeconds = (isDragging ? dragValue * playerState.duration : playerState.currentTime) / 1000;
  
  // 查找当前播放位置对应的歌词
  const getCurrentLyric = () => {
    if (!song.lyrics || song.lyrics.length === 0) return null;
    
    // 找到当前时间之前的最后一行歌词
    for (let i = song.lyrics.length - 1; i >= 0; i--) {
      if (song.lyrics[i].time <= currentTimeInSeconds) {
        return song.lyrics[i];
      }
    }
    
    return song.lyrics[0];
  };
  
  // 获取当前歌词
  const currentLyric = getCurrentLyric();
  
  // 切换歌词/封面显示
  const toggleLyricsView = () => {
    setShowLyrics(!showLyrics);
  };
  
  // 处理播放/暂停按钮点击
  const handleTogglePlayPause = async () => {
    setIsToggling(true);
    try {
      await togglePlayPause();
    } catch (error) {
      console.error('FullScreenPlayer: Error in togglePlayPause:', error);
    }
    // 添加短暂延迟以显示视觉反馈
    setTimeout(() => setIsToggling(false), 200);
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
        
        {/* 显示封面或歌词 */}
        {showLyrics ? (
          // 歌词视图 - 不受封面大小限制
          <TouchableOpacity 
            style={styles.lyricsContainer}
            onPress={toggleLyricsView}
            activeOpacity={0.9}
          >
            <ScrollView contentContainerStyle={styles.lyricsScrollContent}>
              {song.lyrics ? (
                song.lyrics.map((line: LyricLine, index: number) => (
                  <Text
                    key={index}
                    style={[
                      styles.lyricLine,
                      currentLyric && currentLyric.time === line.time ? styles.currentLyricLine : null
                    ]}
                  >
                    {line.text}
                  </Text>
                ))
              ) : (
                <Text style={styles.noLyricsText}>暂无歌词</Text>
              )}
            </ScrollView>
          </TouchableOpacity>
        ) : (
          // 封面视图
          <TouchableOpacity 
            style={styles.coverContainer} 
            onPress={toggleLyricsView}
            activeOpacity={0.9}
          >
            <MotiView
              from={{ scale: 0.95, opacity: 0.5 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: playerState.isPlaying ? '0deg' : '0deg' // 可以添加旋转动画
              }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <View style={[
                styles.coverImageContainer,
                { 
                  borderColor: playerState.isPlaying ? spotifyColors.primary : 'transparent',
                  borderWidth: playerState.isPlaying ? 2 : 0,
                }
              ]}>
                <Image source={{ uri: song.image }} style={styles.coverImage} />
                {/* 播放状态指示器 */}
                {playerState.isPlaying && (
                  <MotiView
                    from={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.8 }}
                    transition={{ type: 'spring', damping: 15 }}
                    style={styles.playingIndicator}
                  >
                    <View style={styles.playingDot} />
                  </MotiView>
                )}
              </View>
            </MotiView>
          </TouchableOpacity>
        )}
        
        {/* 歌曲信息 */}
        <View style={styles.songInfoContainer}>
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{song.title}</Text>
            <Text style={styles.artistName}>{song.artist}</Text>
          </View>
          <IconButton
            icon={isFavorite(song.id) ? "heart" : "heart-outline"}
            iconColor={isFavorite(song.id) ? spotifyColors.primary : spotifyColors.inactive}
            size={24}
            onPress={() => {
              if (isFavorite(song.id)) {
                removeFromFavorites(song.id);
              } else {
                addToFavorites(song);
              }
            }}
          />
        </View>
        
        {/* 控件集中布局区域 */}
        <View style={styles.controlsSection}>
          {/* 进度条 */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.progressBar}
              minimumValue={0}
              maximumValue={1}
              value={progress}
              onValueChange={handleProgressChange}
              onSlidingStart={handleProgressStart}
              onSlidingComplete={handleProgressComplete}
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
              icon={getRepeatIcon()}
              iconColor={getRepeatIconColor()}
              size={28}
              onPress={toggleRepeatMode}
            />
            <IconButton
              icon="skip-previous"
              iconColor={spotifyColors.text}
              size={45}
              onPress={playPrevious}
            />
            <TouchableOpacity
              onPress={handleTogglePlayPause}
              style={[
                styles.mainPlayButton,
                { 
                  opacity: isToggling ? 0.7 : 1,
                  transform: [{ scale: isToggling ? 0.95 : 1 }],
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: spotifyColors.primary,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 8,
                }
              ]}
              activeOpacity={0.8}
              disabled={false}
            >
              <Ionicons 
                name={playerState.isPlaying ? "pause" : "play"} 
                size={36} 
                color={spotifyColors.background} 
              />
            </TouchableOpacity>
            <IconButton
              icon="skip-next"
              iconColor={spotifyColors.text}
              size={45}
              onPress={playNext}
            />
            <IconButton
              icon="playlist-music"
              iconColor={spotifyColors.inactive}
              size={28}
              onPress={() => {}}
            />
          </View>
          
          {/* 底部功能栏 */}
          <View style={styles.extraFeaturesContainer}>
            <View style={styles.extraControlsRow}>
              <TouchableOpacity style={styles.extraControl}>
                <IconButton
                  icon={isDownloaded ? "check-circle" : "download"}
                  iconColor={isDownloaded ? spotifyColors.primary : spotifyColors.inactive}
                  size={24}
                  onPress={() => setIsDownloaded(!isDownloaded)}
                />
                <Text style={styles.extraControlText}>{isDownloaded ? "已下载" : "下载"}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.extraControl}>
                <IconButton
                  icon={timerActive ? "timer" : "timer-outline"}
                  iconColor={timerActive ? spotifyColors.primary : spotifyColors.inactive}
                  size={24}
                  onPress={() => setTimerActive(!timerActive)}
                />
                <Text style={styles.extraControlText}>定时器</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.extraControl}>
                <IconButton
                  icon="share-variant"
                  iconColor={spotifyColors.inactive}
                  size={24}
                />
                <Text style={styles.extraControlText}>分享</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </MotiView>
  );
};

// 默认导出的播放器组件
export default function MusicPlayer() {
  const [expanded, setExpanded] = useState(false);
  const { playerState } = usePlayer();
  
  // 只有当前有歌曲时才显示播放器
  if (!playerState.currentSong) {
    return null;
  }
  
  return (
    <>
      {/* 迷你播放器 - 始终显示在底部 */}
      {!expanded && (
        <MiniPlayer 
          onExpand={() => setExpanded(true)} 
        />
      )}
      
      {/* 全屏播放器 - 展开时显示 */}
      {expanded && (
        <FullScreenPlayer 
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
    bottom: 0, // 固定在屏幕最底部，因为导航栏现在在顶部
    left: 0,
    right: 0,
    height: 80, // 增加高度以避免被圆角屏幕遮挡
    paddingBottom: 20, // 为圆角屏幕留出底部安全区域
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderBottomWidth: 0,
    borderBottomColor: '#333',
    zIndex: 1,
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: '100%',
  },
  miniPlayerMainArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  miniPlayerImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  miniPlayingIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: spotifyColors.primary,
    borderRadius: 6,
    padding: 2,
  },
  miniPlayingDot: {
    width: 4,
    height: 4,
    backgroundColor: spotifyColors.text,
    borderRadius: 2,
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPlayButton: {
    borderRadius: 20,
    marginLeft: 8,
  },
  mainPlayButton: {
    borderRadius: 35,
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
    paddingHorizontal: 20,
    justifyContent: 'space-between', // 添加垂直分布
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerTitle: {
    color: spotifyColors.text,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5, // 与歌词区域一致
    marginBottom: 5, // 与歌词区域一致
    height: screenHeight * 0.5, // 与歌词区域一致
  },
  lyricsContainer: {
    flex: 1,
    marginTop: 5,
    marginBottom: 5,
    maxHeight: screenHeight * 0.5, // 增大歌词区域高度，最多占屏幕一半高度
    borderRadius: 10,
  },
  lyricsScrollContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  lyricLine: {
    color: spotifyColors.inactive,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
  },
  currentLyricLine: {
    color: spotifyColors.text,
    fontSize: 20, // 增大当前歌词字体
    fontWeight: 'bold',
  },
  noLyricsText: {
    color: spotifyColors.inactive,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  coverImageContainer: {
    position: 'relative',
    borderRadius: 12,
    padding: 2,
  },
  coverImage: {
    width: screenWidth * 0.85,
    height: screenWidth * 0.85,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  playingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: spotifyColors.primary,
    borderRadius: 8,
    padding: 4,
  },
  playingDot: {
    width: 8,
    height: 8,
    backgroundColor: spotifyColors.text,
    borderRadius: 4,
  },
  songInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: spotifyColors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  artistName: {
    color: spotifyColors.inactive,
    fontSize: 16,
  },
  controlsSection: {
    marginTop: 0,
    padding: 0,
    justifyContent: 'flex-end',
    height: screenHeight * 0.3, // 设置为视口高度的30%
    paddingTop: 10, // 从15px减小到10px
  },
  progressContainer: {
    marginVertical: 5, // 从10px减小到5px
  },
  progressBar: {
    height: 22, // 保持不变
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: 8, // 从15px减小到8px
  },
  timeText: {
    color: spotifyColors.inactive,
    fontSize: 13,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0, // 从12px减小到0px，减少与底部功能区的间距
    paddingHorizontal: 10,
  },
  extraFeaturesContainer: {
    marginTop: 0, // 从5px减小到0px，减少与控制按钮的间距
    marginBottom: 42, // 增加与视口底部的距离，保持总体平衡
  },
  extraControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  extraControl: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraControlText: {
    color: spotifyColors.inactive,
    fontSize: 12, // 增大字体
    marginTop: -8, // 调整文字位置
  },
}); 