import { MotiView } from 'moti';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// 音乐类别数据
const categories = [
  { id: 1, name: '播客', color: '#FF6B6B' },
  { id: 2, name: '现场表演', color: '#4ECDC4' },
  { id: 3, name: '为你制作', color: '#FFD166' },
  { id: 4, name: '新发行', color: '#6A0572' },
  { id: 5, name: '流行', color: '#1A535C' },
  { id: 6, name: '嘻哈', color: '#FF9A8B' },
  { id: 7, name: '摇滚', color: '#645DD7' },
  { id: 8, name: '民谣', color: '#FF621F' },
  { id: 9, name: '电子', color: '#00B4D8' },
  { id: 10, name: '爵士', color: '#7209B7' },
  { id: 11, name: '古典', color: '#4CC9F0' },
  { id: 12, name: '华语', color: '#EF476F' },
];

export default function SearchScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Spotify主题颜色
  const spotifyColors = {
    primary: '#1DB954', // Spotify绿色
    background: '#121212', // 几乎黑色的背景
    card: '#181818', // 稍微亮一点的黑色
    text: '#FFFFFF',
    inactive: '#b3b3b3', // 灰色，用于非活跃项
  };

  const onChangeSearch = query => setSearchQuery(query);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: spotifyColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: spotifyColors.text }]}>搜索</Text>
        <IconButton 
          icon="microphone" 
          iconColor={spotifyColors.text} 
          size={24} 
          onPress={() => {}} 
        />
      </View>
      
      <Searchbar
        placeholder="艺人、歌曲或播客"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={{ color: spotifyColors.text }}
        iconColor={spotifyColors.inactive}
        placeholderTextColor={spotifyColors.inactive}
        theme={{ colors: { elevation: { level3: spotifyColors.card } } }}
      />
      
      <Text style={[styles.sectionTitle, { color: spotifyColors.text }]}>浏览全部</Text>
      
      <ScrollView contentContainerStyle={styles.categoriesContainer}>
        {categories.map((category, index) => (
          <MotiView
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: category.color }]}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ 
              type: 'timing', 
              duration: 500, 
              delay: index * 100
            }}
          >
            <Text style={styles.categoryText}>{category.name}</Text>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: 24,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100, // 为底部播放器留出空间
  },
  categoryCard: {
    width: '48%',
    height: 100,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    padding: 16,
  },
  categoryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 