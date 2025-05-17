'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Album } from '@/config/albums';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/player';
import MobilePlayer from './player';
import { Howl } from 'howler';
import { cn } from '@/lib/utils';

interface MobileMusicPlayerProps {
  albums: Album[];
}

export default function MobileMusicPlayer({ albums }: MobileMusicPlayerProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const lastBackClickTime = useRef<number>(0);
  const { 
    setIsPlaying,
    isPlaying,
    getGlobalSound, 
    clearGlobalSound, 
    setGlobalSound,
    setDuration 
  } = usePlayerStore();
  const gridRef = useRef<HTMLDivElement>(null);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      const sound = getGlobalSound();
      if (sound) {
        sound.stop();
        sound.unload();
      }
      clearGlobalSound();
      setIsPlaying(false);
    };
  }, [getGlobalSound, clearGlobalSound, setIsPlaying]);

  const selectedAlbum = selectedAlbumId 
    ? albums.find(album => album.id.toString() === selectedAlbumId)
    : null;

  const currentAlbum = currentAlbumId
    ? albums.find(album => album.id.toString() === currentAlbumId)
    : null;

  const currentSong = currentAlbum && currentSongIndex !== null 
    ? currentAlbum.songs[currentSongIndex] 
    : null;

  // 恢复滚动位置
  useEffect(() => {
    if (!selectedAlbum && gridRef.current) {
      const savedScrollPosition = sessionStorage.getItem('musicGridScrollPosition');
      if (savedScrollPosition) {
        gridRef.current.scrollTop = parseInt(savedScrollPosition);
        sessionStorage.removeItem('musicGridScrollPosition');
      }
    }
  }, [selectedAlbum]);

  // 处理专辑选择
  const handleAlbumClick = (albumIndex: number) => {
    if (isAnimating) return;
    
    console.log('Album clicked:', albums[albumIndex].id);
    // 保存滚动位置
    if (gridRef.current) {
      sessionStorage.setItem('musicGridScrollPosition', gridRef.current.scrollTop.toString());
    }
    setIsAnimating(true);
    // 设置返回按钮的冷却时间，与动画时长一致（600ms）
    lastBackClickTime.current = Date.now();
    setSelectedAlbumId(albums[albumIndex].id.toString());
    // 添加历史记录
    window.history.pushState({ albumId: albums[albumIndex].id.toString() }, '');
  };

  // 处理返回操作
  const handleBack = () => {
    if (isAnimating) return;

    // 添加点击时间限制，防止快速点击
    const now = Date.now();
    if (now - lastBackClickTime.current < 650) { // 与动画时长保持一致
      return;
    }
    lastBackClickTime.current = now;

    window.history.back();
  };

  // 监听浏览器返回事件
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isAnimating) return;
      
      setIsAnimating(true);
      setSelectedAlbumId(event.state?.albumId || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAnimating]);

  const handleSongClick = (albumId: string, songIndex: number) => {
    console.log('Song clicked:', songIndex);
    // 先停止并清理当前的音频
    const sound = getGlobalSound();
    if (sound) {
      sound.stop();
      sound.unload();
      clearGlobalSound();
    }
    
    const selectedAlbum = albums.find(album => album.id.toString() === albumId);
    if (!selectedAlbum) return;

    const song = selectedAlbum.songs[songIndex];
    if (!song) return;

    // 先设置状态
    setCurrentAlbumId(albumId);
    setCurrentSongIndex(songIndex);

    // 创建新的 Howl 实例
    const newSound = new Howl({
      src: [song.file_url],
      html5: true, // 改回使用 HTML5 Audio
      format: ['ogg'],
      volume: 1,
      xhr: {
        method: 'GET',
        headers: {
          'Accept': 'audio/ogg',
        },
        withCredentials: false,
      },
      onplay: () => {
        setIsPlaying(true);
      },
      onpause: () => {
        setIsPlaying(false);
      },
      onstop: () => {
        setIsPlaying(false);
      },
      onend: () => {
        setIsPlaying(false);
        // 如果有下一首歌,自动播放下一首
        if (songIndex < selectedAlbum.songs.length - 1) {
          handleSongClick(albumId, songIndex + 1);
        }
      },
      onload: () => {
        setDuration(newSound.duration() || 0);
        // 只在这里触发一次播放
        if (!newSound.playing()) {
          newSound.play();
        }
      },
      onloaderror: (id, error) => {
        console.error('Error loading audio:', error);
        setIsPlaying(false);
      },
      onplayerror: (id, error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    });

    // 更新全局音频实例
    setGlobalSound(newSound);
  };

  // 切换到上一首
  const handlePrevSong = () => {
    if (!currentAlbum || currentSongIndex === null) return;
    
    // 如果是第一首歌，切换到最后一首
    const newIndex = currentSongIndex === 0 
      ? currentAlbum.songs.length - 1 
      : currentSongIndex - 1;
    
    handleSongClick(currentAlbum.id.toString(), newIndex);
  };

  // 切换到下一首
  const handleNextSong = () => {
    if (!currentAlbum || currentSongIndex === null) return;
    
    // 如果是最后一首歌，切换到第一首
    const newIndex = currentSongIndex === currentAlbum.songs.length - 1 
      ? 0 
      : currentSongIndex + 1;
    
    handleSongClick(currentAlbum.id.toString(), newIndex);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      <AnimatePresence 
        mode="sync"
        onExitComplete={() => setIsAnimating(false)}
      >
        {selectedAlbum ? (
          <motion.div
            key="detail"
            className="absolute inset-0 bg-black overflow-auto pb-20"
            onAnimationComplete={() => setIsAnimating(false)}
          >
            <div className="flex flex-col">
              <div className="relative aspect-square w-full">
                <motion.div
                  layoutId={`album-cover-${selectedAlbum.id}`}
                  className="absolute inset-0"
                  transition={{ 
                    layout: {
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }
                  }}
                >
                  <Image
                    src={selectedAlbum.cover}
                    alt={`${selectedAlbum.title} - ${selectedAlbum.artist}`}
                    fill
                    className="object-cover brightness-[85%]"
                    sizes="100vw"
                    priority
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </motion.div>
                <motion.button
                  onClick={handleBack}
                  className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white/20 backdrop-blur-sm transition-colors mix-blend-difference"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.15
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </motion.button>
              </div>

              <motion.div 
                layoutId={`album-info-${selectedAlbum.id}`}
                className="p-4"
                transition={{ 
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <motion.h1 
                  layoutId={`album-title-${selectedAlbum.id}`}
                  className="text-2xl font-bold text-white mb-1"
                >
                  {selectedAlbum.title}
                </motion.h1>
                <motion.p 
                  layoutId={`album-artist-${selectedAlbum.id}`}
                  className="text-white/70 mb-6"
                >
                  {selectedAlbum.artist}
                </motion.p>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.3,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  {selectedAlbum.songs.map((song, index) => (
                    <button
                      key={song.title}
                      onClick={() => handleSongClick(selectedAlbum.id.toString(), index)}
                      className={cn(
                        "w-full text-left p-4 rounded-lg transition-colors",
                        currentAlbum?.id === selectedAlbum.id && currentSongIndex === index
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-8 text-sm",
                          currentAlbum?.id === selectedAlbum.id && currentSongIndex === index
                            ? "text-white"
                            : "opacity-50"
                        )}>{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <span className="block truncate">{song.title}</span>
                          {song.duration && (
                            <span className={cn(
                              "block text-xs mt-0.5",
                              currentAlbum?.id === selectedAlbum.id && currentSongIndex === index
                                ? "text-white/70"
                                : "text-white/40"
                            )}>{song.duration}</span>
                          )}
                        </div>
                        {currentAlbum?.id === selectedAlbum.id && currentSongIndex === index && (
                          <div className="flex-shrink-0">
                            {isPlaying ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            ref={gridRef}
            className="h-full w-full overflow-auto pb-20 bg-black"
          >
            <div className="grid grid-cols-2 divide-x divide-y divide-zinc-800">
              {albums.map((album, albumIndex) => (
                <div
                  key={album.id}
                  className="relative aspect-square cursor-pointer"
                  onClick={() => handleAlbumClick(albumIndex)}
                >
                  <motion.div
                    layoutId={`album-cover-${album.id}`}
                    className="absolute inset-0"
                    transition={{ 
                      layout: {
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1]
                      }
                    }}
                  >
                    <Image
                      src={album.cover}
                      alt={`${album.title} - ${album.artist}`}
                      fill
                      className="object-cover brightness-[85%]"
                      sizes="(max-width: 768px) 50vw"
                      priority
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-black/30 transition-all" />
                  </motion.div>
                  <motion.div 
                    layoutId={`album-info-${album.id}`}
                    className="absolute bottom-3 left-3 right-3"
                    transition={{ 
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <motion.h3 
                      layoutId={`album-title-${album.id}`}
                      className="text-white font-bold text-base leading-tight truncate drop-shadow-lg"
                    >
                      {album.title}
                    </motion.h3>
                    <motion.p 
                      layoutId={`album-artist-${album.id}`}
                      className="text-white/70 text-sm truncate drop-shadow-lg"
                    >
                      {album.artist}
                    </motion.p>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobilePlayer
        cover={currentAlbum?.cover || ''}
        title={currentSong?.title || ''}
        artist={currentAlbum?.artist || ''}
        onPrevSong={handlePrevSong}
        onNextSong={handleNextSong}
      />
    </div>
  );
} 