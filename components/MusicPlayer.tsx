import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

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

// 歌曲类型定义
interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  image: string;
  duration: number;
  lyrics?: LyricLine[];
}

// 歌词行类型定义
interface LyricLine {
  time: number; // 时间戳（秒）
  text: string; // 歌词文本
}

// 迷你播放器（底部固定）
export const MiniPlayer = ({ onExpand, song }: { onExpand: () => void, song: Song }) => {
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
export const FullScreenPlayer = ({ onCollapse, song }: { onCollapse: () => void, song: Song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: 不重复, 1: 重复全部, 2: 重复当前, 3: 随机播放
  const [progress, setProgress] = useState(0.3); // 播放进度，0-1之间
  const [showLyrics, setShowLyrics] = useState(false); // 是否显示歌词
  const [isDownloaded, setIsDownloaded] = useState(false); // 是否已下载
  const [timerActive, setTimerActive] = useState(false); // 定时器是否激活
  
  if (!song) return null;
  
  // 格式化时间
  const formatTime = (seconds: number) => {
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
  const currentTimeInSeconds = progress * song.duration;
  
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
                song.lyrics.map((line, index) => (
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
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <Image source={{ uri: song.image }} style={styles.coverImage} />
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
            icon="heart-outline"
            iconColor={spotifyColors.inactive}
            size={24}
            onPress={() => {}}
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
              icon={getRepeatIcon()}
              iconColor={getRepeatIconColor()}
              size={28}
              onPress={toggleRepeatMode}
            />
            <IconButton
              icon="skip-previous"
              iconColor={spotifyColors.text}
              size={45}
              onPress={() => {}}
            />
            <IconButton
              icon={isPlaying ? "pause-circle" : "play-circle"}
              iconColor={spotifyColors.text}
              size={70}
              onPress={() => setIsPlaying(!isPlaying)}
            />
            <IconButton
              icon="skip-next"
              iconColor={spotifyColors.text}
              size={45}
              onPress={() => {}}
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
  
  // 当前歌曲示例数据
  const currentSong = {
    id: 1,
    title: "晴天",
    artist: "周杰伦",
    album: "叶惠美",
    image: "https://via.placeholder.com/300x300/1DB954/FFFFFF?text=晴天",
    duration: 269, // 歌曲长度（秒）
    lyrics: [
      { time: 0, text: "故事的小黄花" },
      { time: 5, text: "从出生那年就飘着" },
      { time: 10, text: "童年的荡秋千" },
      { time: 14, text: "随记忆一直晃到现在" },
      { time: 20, text: "Re So So Si Do Si La" },
      { time: 25, text: "So La Si Si Si Si La Si La So" },
      { time: 30, text: "吹着前奏望着天空" },
      { time: 35, text: "我想起花瓣试着掉落" },
      { time: 40, text: "为你翘课的那一天" },
      { time: 45, text: "花落的那一天" },
      { time: 50, text: "教室的那一间" },
      { time: 55, text: "我怎么看不见" },
      { time: 60, text: "消失的下雨天" },
      { time: 65, text: "我好想再淋一遍" },
      { time: 70, text: "没想到失去的勇气我还留着" },
      { time: 80, text: "好想再问一遍" },
      { time: 85, text: "你会等待还是离开" },
      { time: 90, text: "刮风这天我试过握着你手" },
      { time: 100, text: "但偏偏雨渐渐大到我看你不见" },
      { time: 110, text: "还要多久我才能在你身边" },
      { time: 120, text: "等到放晴的那天也许我会比较好一点" },
      { time: 130, text: "从前从前有个人爱你很久" },
      { time: 140, text: "但偏偏风渐渐把距离吹得好远" },
      { time: 150, text: "好不容易又能再多爱一天" },
      { time: 160, text: "但故事的最后你好像还是说了拜拜" },
    ]
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
    bottom: 70, // 将bottom设为60，为标签导航栏预留空间，使悬浮条紧贴导航栏顶部
    left: 0,
    right: 0,
    height: 60,
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