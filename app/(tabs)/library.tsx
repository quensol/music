import { MotiView } from 'moti';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Divider, IconButton, Text, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// 播放列表示例数据
const playlists = [
  { 
    id: 1, 
    name: '我喜欢的音乐', 
    description: '40首歌曲',
    image: 'https://i.scdn.co/image/ab67706f00000002ca5a7517156021292e5663a4'
  },
  { 
    id: 2, 
    name: '每日推荐', 
    description: '根据你的收听习惯推荐',
    image: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebcdce7620dc940db079bf4952/1/zh/default'
  },
  { 
    id: 3, 
    name: '心情舒缓', 
    description: '轻松的音乐帮你放松心情',
    image: 'https://i.scdn.co/image/ab67706f000000025551996f500ba876bda73fa5'
  },
  { 
    id: 4, 
    name: '专注工作', 
    description: '提高工作效率的音乐集',
    image: 'https://i.scdn.co/image/ab67706f00000002724554ed6bed6f051d9b0bfc'
  },
  { 
    id: 5, 
    name: '流行热歌', 
    description: '当下最流行的歌曲',
    image: 'https://i.scdn.co/image/ab67706f0000000278b4745cb9ce8ffe32d778b8'
  },
];

// 过滤选项
const filterOptions = ['播放列表', '艺人', '专辑', '播客'];

export default function LibraryScreen() {
  const [selectedFilter, setSelectedFilter] = useState('播放列表');
  const [sortOrder, setSortOrder] = useState('最近');
  
  // Spotify主题颜色
  const spotifyColors = {
    primary: '#1DB954', // Spotify绿色
    background: '#121212', // 几乎黑色的背景
    card: '#181818', // 稍微亮一点的黑色
    text: '#FFFFFF',
    inactive: '#b3b3b3', // 灰色，用于非活跃项
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: spotifyColors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/40' }} 
            style={styles.profileImage} 
          />
          <Text style={[styles.title, { color: spotifyColors.text }]}>音乐库</Text>
        </View>
        <View style={styles.headerIcons}>
          <IconButton 
            icon="magnify" 
            iconColor={spotifyColors.text} 
            size={24} 
            onPress={() => {}} 
          />
          <IconButton 
            icon="plus" 
            iconColor={spotifyColors.text} 
            size={24} 
            onPress={() => {}} 
          />
        </View>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {filterOptions.map((option, index) => (
          <Chip
            key={option}
            selected={selectedFilter === option}
            onPress={() => setSelectedFilter(option)}
            style={[
              styles.filterChip, 
              selectedFilter === option ? 
                { backgroundColor: spotifyColors.primary } : 
                { backgroundColor: spotifyColors.card }
            ]}
            textStyle={{ color: spotifyColors.text }}
          >
            {option}
          </Chip>
        ))}
      </ScrollView>
      
      <View style={styles.sortContainer}>
        <TouchableRipple onPress={() => {}}>
          <View style={styles.sortButton}>
            <IconButton 
              icon="swap-vertical" 
              iconColor={spotifyColors.text} 
              size={20} 
            />
            <Text style={{ color: spotifyColors.text }}>{sortOrder}</Text>
          </View>
        </TouchableRipple>
        <IconButton 
          icon="view-list" 
          iconColor={spotifyColors.text} 
          size={24} 
          onPress={() => {}} 
        />
      </View>
      
      <ScrollView contentContainerStyle={styles.playlistsContainer}>
        {playlists.map((playlist, index) => (
          <MotiView
            key={playlist.id}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ 
              type: 'timing', 
              duration: 400, 
              delay: index * 100
            }}
          >
            <TouchableRipple onPress={() => {}}>
              <View style={styles.playlistItem}>
                <Image source={{ uri: playlist.image }} style={styles.playlistImage} />
                <View style={styles.playlistInfo}>
                  <Text style={{ color: spotifyColors.text, fontWeight: 'bold' }}>{playlist.name}</Text>
                  <Text style={{ color: spotifyColors.inactive }}>{playlist.description}</Text>
                </View>
              </View>
            </TouchableRipple>
            {index < playlists.length - 1 && (
              <Divider style={{ backgroundColor: spotifyColors.inactive, opacity: 0.1 }} />
            )}
          </MotiView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistsContainer: {
    paddingBottom: 100, // 为底部播放器留出空间
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 16,
  },
  playlistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
}); 