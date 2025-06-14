// 歌单中的歌曲类型
export interface PlaylistSong {
  id: number | string;
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  file_url: string;
  albumCover?: string;
  addedAt?: string;
}

// 歌单类型定义
export interface Playlist {
  id: number | string;
  name: string;
  description: string;
  image: string;
  songs: PlaylistSong[];
  createdAt?: string;
  updatedAt?: string;
}

// 歌单数据
export const playlists: Playlist[] = [
  {
    id: 'recently-played',
    name: '最近播放',
    description: '你最近听过的歌曲',
    image: 'https://quensol.sgp1.cdn.digitaloceanspaces.com/moments/image/wlop_winter1_4k.jpg',
    songs: [], // 这个会动态填充
    createdAt: '2024-01-01',
    updatedAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 1,
    name: '我喜欢的音乐',
    description: '3首歌曲',
    image: 'https://quensol.sgp1.cdn.digitaloceanspaces.com/image/static/koharu.jpg',
    songs: [
      {
        id: 1,
        title: '稻香',
        artist: '周杰伦',
        album: '魔杰座',
        duration: '3:43',
        file_url: 'https://music.163.com/song/media/outer/url?id=185868.mp3',
        albumCover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        addedAt: '2024-01-15'
      },
      {
        id: 2,
        title: '青花瓷',
        artist: '周杰伦',
        album: '我很忙',
        duration: '3:58',
        file_url: 'https://music.163.com/song/media/outer/url?id=185868.mp3',
        albumCover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        addedAt: '2024-01-14'
      },
      {
        id: 3,
        title: '夜曲',
        artist: '周杰伦',
        album: '十一月的萧邦',
        duration: '4:32',
        file_url: 'https://music.163.com/song/media/outer/url?id=185868.mp3',
        albumCover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        addedAt: '2024-01-13'
      }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 2,
    name: '每日推荐',
    description: '根据你的收听习惯推荐',
    image: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebcdce7620dc940db079bf4952/1/zh/default',
    songs: [
      {
        id: 4,
        title: '告白气球',
        artist: '周杰伦',
        album: '周杰伦的床边故事',
        duration: '3:34',
        file_url: 'https://music.163.com/song/media/outer/url?id=185868.mp3',
        albumCover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        addedAt: '2024-01-16'
      },
      {
        id: 5,
        title: '七里香',
        artist: '周杰伦',
        album: '七里香',
        duration: '4:05',
        file_url: 'https://music.163.com/song/media/outer/url?id=185868.mp3',
        albumCover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        addedAt: '2024-01-16'
      }
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-16'
  },
  {
    id: 3,
    name: '心情舒缓',
    description: '轻松的音乐帮你放松心情',
    image: 'https://i.scdn.co/image/ab67706f000000025551996f500ba876bda73fa5',
    songs: [
      {
        id: 6,
        title: '安静',
        artist: '周杰伦',
        album: '范特西',
        duration: '5:31',
        file_url: 'https://music.163.com/song/media/outer/url?id=185868.mp3',
        albumCover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        addedAt: '2024-01-12'
      }
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-12'
  },
  {
    id: 4,
    name: '专注工作',
    description: '提高工作效率的音乐集',
    image: 'https://i.scdn.co/image/ab67706f00000002724554ed6bed6f051d9b0bfc',
    songs: [
      {
        id: 7,
        title: '简单爱',
        artist: '周杰伦',
        album: '范特西',
        duration: '4:30',
        file_url: 'https://music.163.com/song/media/outer/url?id=185868.mp3',
        albumCover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        addedAt: '2024-01-11'
      }
    ],
    createdAt: '2024-01-03',
    updatedAt: '2024-01-11'
  },
  {
    id: 5,
    name: '流行热歌',
    description: '当下最流行的歌曲',
    image: 'https://i.scdn.co/image/ab67706f0000000278b4745cb9ce8ffe32d778b8',
    songs: [
      {
        id: 8,
        title: '东风破',
        artist: '周杰伦',
        album: '七里香',
        duration: '5:13',
        file_url: 'https://music.163.com/song/media/outer/url?id=185868.mp3',
        albumCover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        addedAt: '2024-01-10'
      }
    ],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-10'
  }
];

// 根据ID获取歌单
export const getPlaylistById = (id: string | number, recentlyPlayedSongs?: any[]): Playlist | null => {
  const playlist = playlists.find(playlist => playlist.id.toString() === id.toString());
  
  if (!playlist) return null;
  
  // 如果是最近播放歌单，动态填充歌曲
  if (playlist.id === 'recently-played' && recentlyPlayedSongs) {
    return {
      ...playlist,
      songs: recentlyPlayedSongs.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '0:00',
        file_url: song.file_url,
        albumCover: song.image,
        addedAt: new Date().toISOString().split('T')[0]
      })),
      description: `${recentlyPlayedSongs.length}首歌曲`
    };
  }
  
  return playlist;
};

// 获取所有歌单（用于音乐库页面显示）
export const getAllPlaylists = () => {
  return playlists.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    image: playlist.image
  }));
}; 