import audioService from '@/services/AudioService';
import NotificationService from '@/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// 歌词行类型定义
export interface LyricLine {
  time: number; // 时间戳（秒）
  text: string; // 歌词文本
}

// 歌曲类型定义
export interface Song {
  id: number | string;
  title: string;
  artist?: string;
  album?: string;
  image?: string;
  file_url: string;
  duration?: number;
  lyrics?: LyricLine[];
}

// 播放器状态类型
interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playlist: Song[];
  currentIndex: number;
}

// 播放器上下文类型
interface PlayerContextType {
  playerState: PlayerState;
  playSong: (song: Song, playlist?: Song[], index?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPosition: (positionMillis: number) => Promise<void>;
  recentlyPlayed: Song[];
  addToRecentlyPlayed: (song: Song) => void;
  getRecentlyPlayed: () => Song[];
  favoritesSongs: Song[];
  addToFavorites: (song: Song) => void;
  removeFromFavorites: (songId: string | number) => void;
  isFavorite: (songId: string | number) => boolean;
  getFavorites: () => Song[];
}

// 创建上下文
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// 初始状态
const initialState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playlist: [],
  currentIndex: -1,
};

// Provider组件
export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playerState, setPlayerState] = useState<PlayerState>(initialState);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [favoritesSongs, setFavoritesSongs] = useState<Song[]>([]);

  // 获取通知服务实例
  const notificationService = NotificationService.getInstance();

  // 组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      audioService.cleanup();
      notificationService.cleanup();
    };
  }, []);

  // 初始化通知服务
  useEffect(() => {
    const initNotifications = async () => {
      await notificationService.initialize();
    };

    initNotifications();
  }, []);

  // 监听播放状态变化，更新通知
  useEffect(() => {
    const updateNotification = async () => {
      if (playerState.currentSong) {
        const notificationSong = {
          id: playerState.currentSong.id,
          title: playerState.currentSong.title,
          artist: playerState.currentSong.artist || '未知艺术家',
          image: playerState.currentSong.image || '',
          file_url: playerState.currentSong.file_url,
          duration: playerState.currentSong.duration,
        };
        
        await notificationService.showPlayingNotification(notificationSong, playerState.isPlaying);
      } else {
        await notificationService.hideNotification();
      }
    };

    updateNotification();
  }, [playerState.currentSong, playerState.isPlaying]);

  // 加载最近播放记录
  useEffect(() => {
    loadRecentlyPlayed();
  }, []);

  // 加载收藏歌曲
  useEffect(() => {
    loadFavorites();
  }, []);

  // 从AsyncStorage加载最近播放记录
  const loadRecentlyPlayed = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentlyPlayed');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyPlayed(parsed);
      }
    } catch (error) {
      console.error('加载最近播放记录失败:', error);
    }
  };

  // 保存最近播放记录到AsyncStorage
  const saveRecentlyPlayed = async (songs: Song[]) => {
    try {
      await AsyncStorage.setItem('recentlyPlayed', JSON.stringify(songs));
    } catch (error) {
      console.error('保存最近播放记录失败:', error);
    }
  };

  // 添加歌曲到最近播放记录
  const addToRecentlyPlayed = (song: Song) => {
    setRecentlyPlayed(prev => {
      // 移除重复的歌曲（如果存在）
      const filtered = prev.filter(s => s.id !== song.id);
      // 添加到开头，限制最多50首
      const updated = [song, ...filtered].slice(0, 50);
      // 保存到AsyncStorage
      saveRecentlyPlayed(updated);
      return updated;
    });
  };

  // 获取最近播放歌曲
  const getRecentlyPlayed = () => {
    return recentlyPlayed;
  };

  // 从AsyncStorage加载收藏歌曲
  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favoritesSongs');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavoritesSongs(parsed);
      }
    } catch (error) {
      console.error('加载收藏歌曲失败:', error);
    }
  };

  // 保存收藏歌曲到AsyncStorage
  const saveFavorites = async (songs: Song[]) => {
    try {
      await AsyncStorage.setItem('favoritesSongs', JSON.stringify(songs));
    } catch (error) {
      console.error('保存收藏歌曲失败:', error);
    }
  };

  // 添加歌曲到收藏
  const addToFavorites = (song: Song) => {
    setFavoritesSongs(prev => {
      // 检查是否已经收藏
      const isAlreadyFavorite = prev.some(s => s.id === song.id);
      if (isAlreadyFavorite) {
        return prev;
      }
      
      // 添加到收藏列表
      const updated = [song, ...prev];
      // 保存到AsyncStorage
      saveFavorites(updated);
      return updated;
    });
  };

  // 从收藏中移除歌曲
  const removeFromFavorites = (songId: string | number) => {
    setFavoritesSongs(prev => {
      const updated = prev.filter(s => s.id !== songId);
      // 保存到AsyncStorage
      saveFavorites(updated);
      return updated;
    });
  };

  // 检查歌曲是否已收藏
  const isFavorite = (songId: string | number) => {
    return favoritesSongs.some(s => s.id === songId);
  };

  // 获取收藏歌曲列表
  const getFavorites = () => {
    return favoritesSongs;
  };

  const playSong = async (song: Song, playlist: Song[] = [], index: number = 0) => {
    // 更新播放器状态
    setPlayerState(prev => ({
      ...prev,
      currentSong: song,
      playlist: playlist.length > 0 ? playlist : [song],
      currentIndex: index,
      isPlaying: true,
      currentTime: 0,
    }));

    // 添加到最近播放记录
    addToRecentlyPlayed(song);

    // 使用音频服务播放歌曲
    await audioService.playSong(song, (status) => {
      console.log('PlayerContext: Audio status update received:', {
        isLoaded: status.isLoaded,
        isPlaying: status.isPlaying,
        didJustFinish: status.didJustFinish
      });
      
      if (status.isLoaded) {
        setPlayerState(prev => {
          console.log('PlayerContext: Updating state from', prev.isPlaying, 'to', status.isPlaying);
          return {
            ...prev,
            currentTime: status.positionMillis || 0,
            duration: status.durationMillis || 0,
            // 同步播放状态与实际音频状态
            isPlaying: status.isPlaying,
          };
        });

        // 播放完成后自动播放下一首
        if (!status.isPlaying && status.didJustFinish && playerState.playlist.length > 1) {
          // 使用setTimeout避免递归调用问题
          setTimeout(() => {
            playNext();
          }, 100);
        }
      }
    });
  };

  const togglePlayPause = async () => {
    try {
      console.log('PlayerContext: togglePlayPause called, current state:', playerState.isPlaying);
      
      if (playerState.isPlaying) {
        console.log('PlayerContext: Attempting to pause...');
        await audioService.pause();
        console.log('PlayerContext: Pause command sent');
        
        // 临时直接更新状态，确保UI能响应
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false,
        }));
        console.log('PlayerContext: State manually set to paused');
      } else {
        console.log('PlayerContext: Attempting to resume...');
        await audioService.resume();
        console.log('PlayerContext: Resume command sent');
        
        // 临时直接更新状态，确保UI能响应
        setPlayerState(prev => ({
          ...prev,
          isPlaying: true,
        }));
        console.log('PlayerContext: State manually set to playing');
      }
    } catch (error) {
      console.error('PlayerContext: Error toggling play/pause:', error);
    }
  };

  const playNext = async () => {
    if (playerState.playlist.length === 0) return;
    
    const nextIndex = (playerState.currentIndex + 1) % playerState.playlist.length;
    const nextSong = playerState.playlist[nextIndex];
    
    await playSong(nextSong, playerState.playlist, nextIndex);
  };

  const playPrevious = async () => {
    if (playerState.playlist.length === 0) return;
    
    const prevIndex = playerState.currentIndex === 0 
      ? playerState.playlist.length - 1 
      : playerState.currentIndex - 1;
    const prevSong = playerState.playlist[prevIndex];
    
    await playSong(prevSong, playerState.playlist, prevIndex);
  };

  const setCurrentTime = (time: number) => {
    setPlayerState(prev => ({
      ...prev,
      currentTime: time,
    }));
  };

  const setDuration = (duration: number) => {
    setPlayerState(prev => ({
      ...prev,
      duration,
    }));
  };

  const setIsPlaying = (playing: boolean) => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying: playing,
    }));
  };

  const setPosition = async (positionMillis: number) => {
    await audioService.setPosition(positionMillis);
    setPlayerState(prev => ({
      ...prev,
      currentTime: positionMillis,
    }));
  };

  // 设置通知控制回调（在所有函数定义之后）
  useEffect(() => {
    notificationService.setControls({
      onPlay: async () => {
        if (!playerState.isPlaying) {
          await togglePlayPause();
        }
      },
      onPause: async () => {
        if (playerState.isPlaying) {
          await togglePlayPause();
        }
      },
      onNext: async () => {
        await playNext();
      },
      onPrevious: async () => {
        await playPrevious();
      },
      onOpenPlayer: () => {
        // 这里可以添加打开播放器的逻辑
        console.log('从通知栏打开播放器');
      },
    });
  }, [playerState.isPlaying, togglePlayPause, playNext, playPrevious]);

  const value: PlayerContextType = {
    playerState,
    playSong,
    togglePlayPause,
    playNext,
    playPrevious,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setPosition,
    recentlyPlayed,
    addToRecentlyPlayed,
    getRecentlyPlayed,
    favoritesSongs,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavorites,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

// Hook来使用播放器上下文
export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}; 