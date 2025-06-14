import { MotiView } from 'moti';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, List, Text } from 'react-native-paper';

// 用户设置选项
const settingsOptions = [
  { title: '账户', icon: 'account-outline', description: '个人信息和隐私设置' },
  { title: '数据保存', icon: 'database', description: '管理下载内容和缓存' },
  { title: '播放品质', icon: 'music-box-outline', description: '音频质量和下载设置' },
  { title: '通知', icon: 'bell-outline', description: '推送通知设置' },
  { title: '关于', icon: 'information-outline', description: '版本信息和使用条款' },
];

export default function ProfileScreen() {
  // Spotify主题颜色
  const spotifyColors = {
    primary: '#1DB954', // Spotify绿色
    background: '#121212', // 几乎黑色的背景
    card: '#181818', // 稍微亮一点的黑色
    text: '#FFFFFF',
    inactive: '#b3b3b3', // 灰色，用于非活跃项
  };

  return (
    <View style={[styles.container, { backgroundColor: spotifyColors.background }]}>
      <ScrollView>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <View style={styles.profileHeader}>
            <Avatar.Image 
              size={100} 
              source={{ uri: 'https://i.pravatar.cc/300' }} 
              style={styles.avatar}
            />
            <Text style={[styles.username, { color: spotifyColors.text }]}>用户名</Text>
            <Text style={[styles.email, { color: spotifyColors.inactive }]}>user@example.com</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: spotifyColors.text }]}>127</Text>
                <Text style={[styles.statLabel, { color: spotifyColors.inactive }]}>关注者</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: spotifyColors.text }]}>72</Text>
                <Text style={[styles.statLabel, { color: spotifyColors.inactive }]}>正在关注</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: spotifyColors.text }]}>14</Text>
                <Text style={[styles.statLabel, { color: spotifyColors.inactive }]}>播放列表</Text>
              </View>
            </View>
            
            <Button
              mode="outlined"
              style={[styles.editButton, { borderColor: spotifyColors.inactive }]}
              textColor={spotifyColors.text}
              onPress={() => {}}
            >
              编辑个人资料
            </Button>
          </View>
        </MotiView>
        
        <Text style={[styles.sectionTitle, { color: spotifyColors.text }]}>设置</Text>
        
        <View style={[styles.settingsContainer, { backgroundColor: spotifyColors.card }]}>
          {settingsOptions.map((option, index) => (
            <MotiView
              key={option.title}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ 
                type: 'timing', 
                duration: 400, 
                delay: index * 100
              }}
            >
              <List.Item
                title={option.title}
                titleStyle={{ color: spotifyColors.text }}
                description={option.description}
                descriptionStyle={{ color: spotifyColors.inactive }}
                left={props => <List.Icon {...props} icon={option.icon} color={spotifyColors.text} />}
                right={props => <List.Icon {...props} icon="chevron-right" color={spotifyColors.inactive} />}
                onPress={() => {}}
              />
              {index < settingsOptions.length - 1 && (
                <Divider style={{ backgroundColor: spotifyColors.inactive, opacity: 0.1 }} />
              )}
            </MotiView>
          ))}
        </View>
        
        <View style={styles.logoutContainer}>
          <Button
            mode="text"
            textColor={spotifyColors.inactive}
            onPress={() => {}}
          >
            退出登录
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  editButton: {
    borderRadius: 20,
    width: 200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingsContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 24,
  },
  logoutContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
}); 