import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface Song {
  id: string | number;
  title: string;
  artist: string;
  image: string;
  file_url: string;
  duration?: number;
}

export interface NotificationControls {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onOpenPlayer: () => void;
}

class NotificationService {
  private static instance: NotificationService;
  private currentNotificationId: string | null = null;
  private controls: NotificationControls | null = null;
  private isInitialized: boolean = false;
  private isExpoGo: boolean = false;

  private constructor() {
    // 检测是否在Expo Go环境中运行
    this.isExpoGo = Constants.appOwnership === 'expo';
    console.log('通知服务环境检测:', this.isExpoGo ? 'Expo Go' : 'Development Build');
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('开始初始化通知服务...');
      
      if (this.isExpoGo) {
        console.log('检测到Expo Go环境，使用简化通知功能');
      }
      
      // 请求通知权限
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('通知权限状态:', status);
      
      if (status !== 'granted') {
        console.warn('通知权限未授予，状态:', status);
        // 即使权限未授予，也继续初始化，某些功能可能仍然可用
      }

      // 设置通知处理器
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: this.isExpoGo ? true : false, // Expo Go中可能需要显示alert
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });

      // 监听通知点击
      Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);

      this.isInitialized = true;
      console.log('通知服务初始化成功，权限状态:', status);
    } catch (error) {
      console.error('通知服务初始化失败:', error);
      // 即使初始化失败，也标记为已初始化，避免重复尝试
      this.isInitialized = true;
    }
  }

  private handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    console.log('通知响应:', response);
    
    // 点击通知时打开播放器
    if (this.controls) {
      this.controls.onOpenPlayer();
    }
  };

  public setControls(controls: NotificationControls) {
    this.controls = controls;
  }

  public async showPlayingNotification(song: Song, isPlaying: boolean) {
    console.log('尝试显示播放通知:', song.title, isPlaying ? '播放中' : '已暂停');
    
    if (!this.isInitialized) {
      console.log('通知服务未初始化，正在初始化...');
      await this.initialize();
    }

    try {
      // 在Expo Go中，某些通知功能可能受限
      if (this.isExpoGo) {
        console.log('Expo Go环境：尝试显示本地通知');
      }

      // 取消之前的通知
      if (this.currentNotificationId) {
        console.log('取消之前的通知:', this.currentNotificationId);
        await Notifications.dismissNotificationAsync(this.currentNotificationId);
      }

      const statusText = isPlaying ? '正在播放' : '已暂停';
      const statusIcon = isPlaying ? '▶️' : '⏸️';

      const notificationContent: Notifications.NotificationContentInput = {
        title: `${statusIcon} ${song.title}`,
        body: `${song.artist} • ${statusText}`,
        data: { 
          songId: song.id,
          isPlaying: isPlaying,
          action: 'music_control'
        },
      };

      // 根据环境调整通知设置
      if (this.isExpoGo) {
        // Expo Go环境的简化设置
        notificationContent.priority = Notifications.AndroidNotificationPriority.DEFAULT;
      } else {
        // Development Build环境的完整设置
        notificationContent.sticky = true;
        notificationContent.priority = Notifications.AndroidNotificationPriority.HIGH;
      }

      // 平台特定设置
      if (Platform.OS === 'android') {
        notificationContent.sound = false;
        notificationContent.vibrate = false;
      }

      console.log('准备发送通知，内容:', notificationContent.title);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // 立即显示
      });

      this.currentNotificationId = notificationId;
      console.log('播放通知已显示成功，ID:', notificationId, '歌曲:', song.title, '状态:', statusText);
    } catch (error) {
      console.error('显示播放通知失败:', error);
      console.error('错误详情:', error.message);
      
      // 在Expo Go中，如果通知失败，提供替代方案
      if (this.isExpoGo) {
        console.log('Expo Go环境通知失败，这是正常现象。建议使用Development Build获得完整功能。');
      }
    }
  }

  public async hideNotification() {
    try {
      if (this.currentNotificationId) {
        await Notifications.dismissNotificationAsync(this.currentNotificationId);
        this.currentNotificationId = null;
        console.log('播放通知已隐藏');
      }
    } catch (error) {
      console.error('隐藏通知失败:', error);
    }
  }

  public async updateNotification(song: Song, isPlaying: boolean) {
    // 更新通知内容
    await this.showPlayingNotification(song, isPlaying);
  }

  // 清理资源
  public cleanup() {
    this.hideNotification();
    this.controls = null;
    this.isInitialized = false;
  }
}

export default NotificationService; 