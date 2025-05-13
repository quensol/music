import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Spotify主题颜色
const spotifyColors = {
  primary: '#1DB954', // Spotify绿色
  background: '#121212', // 几乎黑色的背景
  card: '#181818', // 稍微亮一点的黑色
  text: '#FFFFFF',
  inactive: '#b3b3b3', // 灰色，用于非活跃项
};

export default function FavoritesScreen() {
  const router = useRouter();
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  // 添加防抖返回功能
  const handleBackPress = useCallback(() => {
    if (isNavigatingBack) return;
    
    setIsNavigatingBack(true);
    router.back();
    
    // 防止多次点击
    setTimeout(() => {
      setIsNavigatingBack(false);
    }, 1000);
  }, [router, isNavigatingBack]);

  return (
    <View style={{ flex: 1, backgroundColor: spotifyColors.background }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <View style={styles.backButtonContainer}>
              <IconButton 
                icon="arrow-left" 
                iconColor={spotifyColors.text} 
                size={24} 
                onPress={handleBackPress}
                style={styles.backButton}
                disabled={isNavigatingBack}
              />
            </View>
            <Text style={[styles.title, { color: spotifyColors.text }]}>我的收藏</Text>
          </View>
          <View style={styles.headerIcons}>
            <IconButton 
              icon="magnify" 
              iconColor={spotifyColors.text} 
              size={24} 
              onPress={() => {}} 
              style={styles.iconButton}
            />
          </View>
        </View>
        
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.emptyState}>
            <IconButton 
              icon="heart-outline" 
              iconColor={spotifyColors.inactive}
              size={80}
            />
            <Text style={[styles.emptyStateTitle, { color: spotifyColors.text }]}>
              还没有收藏歌曲
            </Text>
            <Text style={[styles.emptyStateText, { color: spotifyColors.inactive }]}>
              点击歌曲旁边的心形图标，将它们添加到您的收藏中
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
  backButtonContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  backButton: {
    margin: 0,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    margin: 0,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
}); 