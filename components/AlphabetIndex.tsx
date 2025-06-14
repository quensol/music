import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

interface AlphabetIndexProps {
  onLetterPress: (letter: string) => void;
  activeIndex?: string;
  style?: any;
}

const ALPHABET = [
  '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

// Spotify主题颜色
const spotifyColors = {
  primary: '#1DB954', // Spotify绿色
  background: '#121212', // 几乎黑色的背景
  card: '#181818', // 稍微亮一点的黑色
  text: '#FFFFFF',
  inactive: '#b3b3b3', // 灰色，用于非活跃项
};

const AlphabetIndex: React.FC<AlphabetIndexProps> = ({
  onLetterPress,
  activeIndex,
  style
}) => {
  const screenHeight = Dimensions.get('window').height;
  const itemHeight = Math.min((screenHeight - 200) / ALPHABET.length, 24); // 动态计算每个字母的高度

  return (
    <View style={[styles.container, style]}>
      {ALPHABET.map((letter) => (
        <TouchableOpacity
          key={letter}
          style={[
            styles.letterContainer,
            { height: itemHeight },
            activeIndex === letter && styles.activeLetter
          ]}
          onPress={() => onLetterPress(letter)}
          activeOpacity={0.6}
        >
          <Text
            style={[
              styles.letter,
              { fontSize: Math.min(itemHeight * 0.6, 12) },
              activeIndex === letter && styles.activeLetterText
            ]}
          >
            {letter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -200 }], // 大概居中
    backgroundColor: 'rgba(24, 24, 24, 0.9)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  letterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 1,
    minWidth: 24,
  },
  activeLetter: {
    backgroundColor: spotifyColors.primary,
  },
  letter: {
    color: spotifyColors.inactive,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeLetterText: {
    color: spotifyColors.text,
  },
});

export default AlphabetIndex; 