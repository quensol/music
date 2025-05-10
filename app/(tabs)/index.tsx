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
    image: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebcdce7620dc940db079bf4952/1/zh/default'
  },
  { 
    id: 2, 
    title: '流行热歌', 
    image: 'https://i.scdn.co/image/ab67706f0000000278b4745cb9ce8ffe32d778b8'
  },
  { 
    id: 3, 
    title: '放松音乐', 
    image: 'https://i.scdn.co/image/ab67706f000000025551996f500ba876bda73fa5'
  },
  { 
    id: 4, 
    title: '工作专注', 
    image: 'https://i.scdn.co/image/ab67706f00000002724554ed6bed6f051d9b0bfc'
  },
];

// 为你推荐的数据
const forYou = [
  { 
    id: 1, 
    title: '周杰伦', 
    subtitle: '艺人',
    image: 'https://i.scdn.co/image/ab6761610000e5eba8683239a58d4a9adf3713f4'
  },
  { 
    id: 2, 
    title: '华语流行', 
    subtitle: '播放列表',
    image: 'https://i.scdn.co/image/ab67706f000000023082add063ae6a6e7b55d409'
  },
  { 
    id: 3, 
    title: '最新发行', 
    subtitle: '播放列表',
    image: 'https://i.scdn.co/image/ab67706f00000002fe6d8d1019d5b302213e3730'
  },
  { 
    id: 4, 
    title: '人气播客', 
    subtitle: '播客',
    image: 'https://i.scdn.co/image/ab67656300005f1f848fa8fccad48b633ae5582c'
  },
  { 
    id: 5, 
    title: '环球音乐', 
    subtitle: '唱片公司',
    image: 'https://i.scdn.co/image/ab67706c0000da84fcb8b92f2615d3261b8eb146'
  },
  { 
    id: 6, 
    title: '独立精选', 
    subtitle: '播放列表',
    image: 'https://i.scdn.co/image/ab67706f000000027876fe166a29b8e6b8db14da'
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
            {[1, 2, 3, 4].map((item, index) => (
              <MotiView
                key={item}
                from={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 600, delay: 600 + index * 100 }}
                style={styles.podcastCard}
              >
                <Card style={{ backgroundColor: spotifyColors.card }}>
                  <Card.Cover source={{ uri: 'https://i.scdn.co/image/ab67656300005f1fa1c3278c0856b7e207bee36c' }} />
                  <Card.Content style={{ paddingVertical: 8 }}>
                    <Title style={{ color: spotifyColors.text, fontSize: 14 }}>每日话题</Title>
                    <Paragraph style={{ color: spotifyColors.inactive, fontSize: 12 }}>时长: 45 分钟</Paragraph>
                  </Card.Content>
                </Card>
              </MotiView>
            ))}
          </ScrollView>
        </View>
        
        {/* 底部空间，为播放器留出位置 */}
        <View style={{ height: 80 }} />
      </ScrollView>
      
      {/* 底部播放器 - 固定位置 */}
      <MotiView
        from={{ translateY: 80 }}
        animate={{ translateY: 0 }}
        transition={{ type: 'spring', delay: 1000 }}
        style={[styles.player, { backgroundColor: spotifyColors.card }]}
      >
        <View style={styles.playerContent}>
          <Image 
            source={{ uri: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228' }} 
            style={styles.playerImage} 
          />
          <View style={styles.playerInfo}>
            <Text style={{ color: spotifyColors.text, fontWeight: 'bold' }}>当前播放歌曲</Text>
            <Text style={{ color: spotifyColors.inactive }}>歌手名称</Text>
          </View>
          <View style={styles.playerControls}>
            <IconButton
              icon="heart-outline"
              iconColor={spotifyColors.inactive}
              size={24}
              onPress={() => {}}
            />
            <IconButton
              icon="pause"
              iconColor={spotifyColors.text}
              size={24}
              style={{ backgroundColor: spotifyColors.primary, margin: 0 }}
              onPress={() => {}}
            />
          </View>
        </View>
      </MotiView>
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
  },
  player: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: '100%',
  },
  playerImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
