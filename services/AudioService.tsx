import { Song } from '@/contexts/PlayerContext';
import { Audio } from 'expo-av';

class AudioService {
  private static instance: AudioService | null = null;
  private sound: Audio.Sound | null = null;
  private currentSong: Song | null = null;
  private onStatusUpdate?: (status: any) => void;
  private isInitialized: boolean = false;
  private isPlaying: boolean = false;

  // 私有构造函数，防止外部直接实例化
  private constructor() {
    this.initializeAudio();
  }

  // 初始化音频配置
  private async initializeAudio() {
    if (this.isInitialized) return;
    
    try {
      // 设置音频模式，确保单例播放行为
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: 1, // DoNotMix
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // DoNotMix
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio mode:', error);
    }
  }

  // 获取单例实例
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // 获取当前播放状态
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async playSong(song: Song, onStatusUpdate?: (status: any) => void) {
    try {
      // 防止同时播放多个音频
      if (this.isPlaying && this.currentSong?.id === song.id) {
        console.log('Song is already playing:', song.title);
        return true;
      }

      // 确保音频已初始化
      await this.initializeAudio();
      
      // 停止并卸载当前音频
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }

      this.currentSong = song;
      this.onStatusUpdate = onStatusUpdate;
      this.isPlaying = true;

      console.log('Playing song:', song.title, 'URL:', song.file_url);

      // 创建新的音频对象
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.file_url },
        { shouldPlay: true },
        this.handleStatusUpdate
      );

      this.sound = newSound;
      return true;
    } catch (error) {
      console.error('Error playing sound:', error);
      this.isPlaying = false;
      return false;
    }
  }

  async pause() {
    if (this.sound) {
      console.log('AudioService: Pausing audio...');
      await this.sound.pauseAsync();
      this.isPlaying = false;
      console.log('AudioService: Audio paused, isPlaying:', this.isPlaying);
      
      // 强制触发状态更新回调
      if (this.onStatusUpdate) {
        this.onStatusUpdate({
          isLoaded: true,
          isPlaying: false,
          didJustFinish: false,
          positionMillis: 0,
          durationMillis: 0
        });
      }
    }
  }

  async resume() {
    if (this.sound) {
      console.log('AudioService: Resuming audio...');
      await this.sound.playAsync();
      this.isPlaying = true;
      console.log('AudioService: Audio resumed, isPlaying:', this.isPlaying);
      
      // 强制触发状态更新回调
      if (this.onStatusUpdate) {
        this.onStatusUpdate({
          isLoaded: true,
          isPlaying: true,
          didJustFinish: false,
          positionMillis: 0,
          durationMillis: 0
        });
      }
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
    this.isPlaying = false;
    this.currentSong = null;
  }

  async setPosition(positionMillis: number) {
    if (this.sound) {
      await this.sound.setPositionAsync(positionMillis);
    }
  }

  private handleStatusUpdate = (status: any) => {
    console.log('Audio status update:', {
      isLoaded: status.isLoaded,
      isPlaying: status.isPlaying,
      didJustFinish: status.didJustFinish,
      internalIsPlaying: this.isPlaying
    });
    
    // 同步内部播放状态与实际音频状态
    if (status.isLoaded) {
      // 如果播放完成，重置状态
      if (!status.isPlaying && status.didJustFinish) {
        this.isPlaying = false;
        console.log('Song finished, setting isPlaying to false');
      }
      // 同步播放状态 - 让AudioService的状态跟随实际音频状态
      else if (status.isPlaying !== this.isPlaying) {
        this.isPlaying = status.isPlaying;
        console.log('Syncing internal state to audio state:', this.isPlaying);
      }
    }
    
    if (this.onStatusUpdate) {
      this.onStatusUpdate(status);
    }
  };

  getCurrentSong() {
    return this.currentSong;
  }

  getSound() {
    return this.sound;
  }

  async cleanup() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
    this.isPlaying = false;
    this.currentSong = null;
    this.onStatusUpdate = undefined;
  }

  // 重置单例实例（主要用于测试或特殊情况）
  public static resetInstance() {
    if (AudioService.instance) {
      AudioService.instance.cleanup();
      AudioService.instance = null;
    }
  }
}

// 导出单例实例
export const audioService = AudioService.getInstance();
export default audioService; 