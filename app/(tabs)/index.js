import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchTrending, fetchUpcoming, fetchTopRated } from '../../services/tmdbApi';
import Header from '../../components/Header';
import PosterCard from '../../components/PosterCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState({
    trending: [],
    upcoming: [],
    topRated: [],
    trendingTv: [],
    topRatedTv: [],
    combinedTrending: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [trendingWeek, upcoming, topRated, trendingTv, topRatedTv] = await Promise.all([
        fetchTrending('movie', 'week'),
        fetchUpcoming('movie'),
        fetchTopRated('movie'),
        fetchTrending('tv', 'week'),
        fetchTopRated('tv'),
      ]);
      
      // Mix movies and TV shows for the hero section
      const combined = [];
      const maxLength = Math.max(trendingWeek.length, trendingTv.length);
      for (let i = 0; i < maxLength && combined.length < 10; i++) {
        if (trendingWeek[i]) combined.push({ ...trendingWeek[i], media_type: 'movie' });
        if (trendingTv[i]) combined.push({ ...trendingTv[i], media_type: 'tv' });
      }

      setData({ 
        trending: trendingWeek, 
        upcoming, 
        topRated, 
        trendingTv, 
        topRatedTv,
        combinedTrending: combined 
      });
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHero = () => (
    <View style={styles.heroWrapper}>
      <FlatList
        data={data.combinedTrending.slice(0, 10)}
        horizontal
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `hero-${item.media_type}-${item.id}`}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.heroCard}
            onPress={() => router.push({
              pathname: '/details',
              params: { id: item.id, type: item.media_type || 'movie' }
            })}
          >
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/original${item.backdrop_path}` }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>{item.title || item.name}</Text>
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>MUST WATCH</Text>
                </View>
                <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.2)', marginLeft: 8 }]}>
                  <Text style={[styles.heroBadgeText, { color: '#fff' }]}>
                    {item.media_type === 'tv' ? 'TV SHOW' : 'MOVIE'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.heroGradient} />
    </View>
  );

  const renderSection = (title, items, type = 'movie') => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <PosterCard item={item} type={type} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#fff" /></View>;

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
      <Header />
      <View style={styles.content}>
        {renderHero()}
        
        {renderSection('Trending Movies Now', data.trending)}
        {renderSection('Trending TV Shows Now', data.trendingTv, 'tv')}
        
        <View style={styles.top10Container}>
          <Text style={styles.sectionTitle}>Top 10 This Week</Text>
          <FlatList
            data={data.trending.slice(0, 10)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={styles.top10Card}
                onPress={() => router.push({
                  pathname: '/details',
                  params: { id: item.id, type: 'movie' }
                })}
              >
                <View style={styles.rankContainer}>
                  <Text style={styles.rankText}>No {index + 1}</Text>
                </View>
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}` }}
                  style={styles.top10Image}
                />
                <View style={styles.top10Overlay}>
                  <Text style={styles.top10Title} numberOfLines={1}>{item.title || item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingLeft: 16 }}
          />
        </View>

        {renderSection('New Movies', data.upcoming)}
        {renderSection('G.O.A.T Movies', data.topRated)}
        {renderSection('G.O.A.T TV Shows', data.topRatedTv, 'tv')}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
  centered: { 
    flex: 1, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  content: { 
    paddingBottom: 28,
  },
  heroContainer: { 
    height: 280,
  },
  heroWrapper: { 
    marginBottom: 20,
  },
  heroCard: { 
    width: width, 
    height: 280,
  },
  heroImage: { 
    width: '94%', 
    height: '100%', 
    borderRadius: 24, 
    alignSelf: 'center',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: '3%',
    right: '3%',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: { 
    color: '#fff', 
    fontSize: 26, 
    fontWeight: '800',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.85)', 
    textShadowOffset: { width: 0, height: 2 }, 
    textShadowRadius: 8,
  },
  heroBadgeRow: { 
    flexDirection: 'row', 
    marginTop: 12,
    gap: 8,
  },
  heroBadge: { 
    backgroundColor: '#fff', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 6,
  },
  heroBadgeText: { 
    color: '#000', 
    fontSize: 11, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: { 
    marginVertical: 22,
  },
  sectionTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '800', 
    marginLeft: 16, 
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  top10Container: { 
    backgroundColor: '#0a0a0a',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  top10Card: { 
    width: 240, 
    height: 135, 
    marginRight: 16, 
    borderRadius: 14, 
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  top10Image: { 
    width: '100%', 
    height: '100%', 
    opacity: 0.85,
  },
  top10Overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  top10Title: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '700',
  },
  rankContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    zIndex: 1,
  },
  rankText: { 
    color: '#000', 
    fontSize: 11, 
    fontWeight: '900',
  },
});
