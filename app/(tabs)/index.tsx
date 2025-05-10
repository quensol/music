import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, Paragraph, Text, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// 最近播放的数据
const recentlyPlayed = [
  { 
    id: 1, 
    title: '每日推荐', 
    image: 'https://picsum.photos/id/1025/300'
  },
  { 
    id: 2, 
    title: '流行热歌', 
    image: 'https://via.placeholder.com/200x200/FF5733/FFFFFF?text=流行热歌'
  },
  { 
    id: 3, 
    title: '放松音乐', 
    image: 'https://via.placeholder.com/200x200/33A8FF/FFFFFF?text=放松音乐'
  },
  { 
    id: 4, 
    title: '工作专注', 
    image: 'https://via.placeholder.com/200x200/8033FF/FFFFFF?text=工作专注'
  },
];

// 为你推荐的数据
const forYou = [
  { 
    id: 1, 
    title: '周杰伦', 
    subtitle: '艺人',
    image: 'https://i.pravatar.cc/150?img=3'
  },
  { 
    id: 2, 
    title: '华语流行', 
    subtitle: '播放列表',
    image: 'https://via.placeholder.com/300x300/1DB954/FFFFFF?text=华语流行'
  },
  { 
    id: 3, 
    title: '最新发行', 
    subtitle: '播放列表',
    image: 'https://picsum.photos/id/1028/300'
  },
  { 
    id: 4, 
    title: '人气播客', 
    subtitle: '播客',
    image: 'https://robohash.org/artist1?set=set2&size=150x150'
  },
  { 
    id: 5, 
    title: '环球音乐', 
    subtitle: '唱片公司',
    image: 'https://via.placeholder.com/300x300/121212/FFFFFF?text=环球音乐'
  },
  { 
    id: 6, 
    title: '独立精选', 
    subtitle: '播放列表',
    image: 'https://picsum.photos/300'
  },
];

// 热门播客数据
const podcasts = [
  {
    id: 1,
    title: '音乐故事',
    duration: '35 分钟',
    image: 'https://robohash.org/artist2?set=set2&size=180x180'
  },
  {
    id: 2,
    title: '每日话题',
    duration: '45 分钟',
    image: 'https://via.placeholder.com/180x180/6A0572/FFFFFF?text=每日话题'
  },
  {
    id: 3,
    title: '心理健康',
    duration: '60 分钟',
    image: 'https://robohash.org/artist3?set=set2&size=180x180'
  },
  {
    id: 4,
    title: '科技新闻',
    duration: '25 分钟',
    image: 'https://via.placeholder.com/180x180/00B4D8/FFFFFF?text=科技新闻'
  },
];

export default function HomeScreen() {
  // Spotify主题颜色
  const spotifyColors = {
    primary: '#1DB954', // Spotify绿色
    background: '#121212', // 几乎黑色的背景
    card: '#181818', // 稍微亮一点的黑色
    text: '#FFFFFF',
    inactive: '#b3b3b3', // 灰色，用于非活跃项
  };

  // 问候语基于当前时间
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return '早上好';
    if (hours < 18) return '下午好';
    return '晚上好';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: spotifyColors.background }}>
      <ScrollView style={styles.container}>
        {/* 顶部渐变和问候语 */}
        <LinearGradient
          colors={['#4A3030', spotifyColors.background]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <View style={styles.headerIcons}>
              <IconButton
                icon="bell-outline"
                iconColor={spotifyColors.text}
                size={24}
                onPress={() => {}}
              />
              <IconButton
                icon="history"
                iconColor={spotifyColors.text}
                size={24}
                onPress={() => {}}
              />
              <IconButton
                icon="cog-outline"
                iconColor={spotifyColors.text}
                size={24}
                onPress={() => {}}
              />
            </View>
          </View>
          
          {/* 快捷访问按钮 */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.shortcutsContainer}
          >
            {recentlyPlayed.map((item, index) => (
              <MotiView
                key={item.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500, delay: index * 100 }}
                style={styles.shortcutItem}
              >
                <TouchableOpacity style={styles.shortcutButton}>
                  <Image source={{ uri: item.image }} style={styles.shortcutImage} />
                  <Text style={styles.shortcutText} numberOfLines={2}>{item.title}</Text>
                </TouchableOpacity>
              </MotiView>
            ))}
          </ScrollView>
        </LinearGradient>
        
        {/* 为你推荐 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>为你推荐</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendationsContainer}
          >
            {forYou.map((item, index) => (
              <MotiView
                key={item.id}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 300 + index * 100 }}
                style={styles.recommendationCard}
              >
                <TouchableOpacity>
                  <Image source={{ uri: item.image }} style={styles.recommendationImage} />
                  <Text style={styles.recommendationTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.recommendationSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                </TouchableOpacity>
              </MotiView>
            ))}
          </ScrollView>
        </View>
        
        {/* 热门播客 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>热门播客</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.podcastsContainer}
          >
            {podcasts.map((podcast, index) => (
              <MotiView
                key={podcast.id}
                from={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 600, delay: 600 + index * 100 }}
                style={styles.podcastCard}
              >
                <Card style={{ backgroundColor: spotifyColors.card }}>
                  <Card.Cover source={{ uri: podcast.image }} />
                  <Card.Content style={{ paddingVertical: 8 }}>
                    <Title style={{ color: spotifyColors.text, fontSize: 14 }}>{podcast.title}</Title>
                    <Paragraph style={{ color: spotifyColors.inactive, fontSize: 12 }}>时长: {podcast.duration}</Paragraph>
                  </Card.Content>
                </Card>
              </MotiView>
            ))}
          </ScrollView>
        </View>
        
        {/* 底部空间，为播放器留出位置 */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  shortcutsContainer: {
    marginBottom: 8,
  },
  shortcutItem: {
    marginRight: 16,
    width: 120,
  },
  shortcutButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  shortcutImage: {
    width: 40,
    height: 40,
    borderRadius: 2,
    marginRight: 8,
  },
  shortcutText: {
    color: 'white',
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recommendationsContainer: {
    paddingRight: 16,
  },
  recommendationCard: {
    marginRight: 16,
    width: 150,
  },
  recommendationImage: {
    width: 150,
    height: 150,
    borderRadius: 4,
    marginBottom: 8,
  },
  recommendationTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recommendationSubtitle: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  podcastsContainer: {
    paddingRight: 16,
  },
  podcastCard: {
    width: 180,
    marginRight: 16,
  }
});
