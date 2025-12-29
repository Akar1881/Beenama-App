import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/original';
const { width: screenWidth } = Dimensions.get('window');

export default function PosterCard({ item, type = 'movie', size = 'medium' }) {
  const router = useRouter();
  
  // Calculate width for 3-column grid
  const columnSpacing = 16;
  const horizontalPadding = 12;
  const cardWidth = (screenWidth - (horizontalPadding * 2) - (columnSpacing * 1)) / 3;
  
  const width = size === 'small' ? cardWidth : size === 'large' ? 160 : 120;
  const height = width * 1.5;

  return (
    <TouchableOpacity 
      style={[styles.container, { width }]}
      onPress={() => router.push({
        pathname: '/details',
        params: { id: item.id, type: item.media_type || type }
      })}
    >
      <Image
        source={{ uri: item.poster_path ? `${TMDB_IMAGE_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster' }}
        style={[styles.poster, { height }]}
      />
      <Text style={styles.title} numberOfLines={1}>
        {item.title || item.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 4,
    marginBottom: 12,
  },
  poster: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  title: {
    color: '#fff',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
});
