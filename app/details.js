import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Linking, Dimensions, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { ArrowLeft, Play, Plus, Heart, Bookmark, Info } from 'lucide-react-native';
import { fetchDetails } from '../services/tmdbApi';
import { getAuthState, addToWatchlist, addToFavorites } from '../services/authService';
import PosterCard from '../components/PosterCard';
import ListsModal from '../components/ListsModal';

const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_URL = 'https://image.tmdb.org/t/p/w780';
const { width: screenWidth } = Dimensions.get('window');

export default function DetailsScreen() {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showListsModal, setShowListsModal] = useState(false);
  const [authState, setAuthState] = useState({ sessionId: null, account: null });

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    loadDetails();
    checkAuth();
  }, [id]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const checkAuth = async () => {
    const state = await getAuthState();
    setAuthState(state);
  };

  const loadDetails = async () => {
    const data = await fetchDetails(type, id);
    setDetails(data);
    setLoading(false);
  };

  const openVideo = (key) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${key}`);
  };

  const handleAddPress = () => {
    if (!authState.sessionId) {
      setShowNotification(true);
      return;
    }
    setShowListsModal(true);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#fff" /></View>;
  if (!details) return null;

  const trailers = details.videos?.results?.filter(v => v.type === 'Trailer') || [];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Image 
          source={{ uri: `${TMDB_BACKDROP_URL}${details.backdrop_path}` }} 
          style={styles.backdrop} 
        />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Image 
              source={{ uri: `${TMDB_IMAGE_URL}${details.poster_path}` }} 
              style={styles.poster} 
            />
            <View style={styles.info}>
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => router.push({
                    pathname: '/watch',
                    params: { id, type, title: details.title || details.name, poster: details.poster_path }
                  })}
                >
                  <Play size={18} color="#000" fill="#000" />
                  <Text style={styles.actionText}>WATCH</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' }]}
                  onPress={handleAddPress}
                >
                  <Plus size={18} color="#fff" />
                  <Text style={[styles.actionText, { color: '#fff' }]}>Add</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.title}>{details.title || details.name}</Text>
              <Text style={styles.meta}>
                {details.release_date || details.first_air_date} • {details.vote_average.toFixed(1)} ★
              </Text>
              <Text style={styles.meta}>
                {details.genres?.map(g => g.name).join(', ')}
              </Text>
              {type === 'tv' && (
                <Text style={styles.meta}>
                  {details.number_of_seasons} Seasons • {details.number_of_episodes} Episodes
                </Text>
              )}
            </View>
          </View>

          {trailers.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Trailers</Text>
              <FlatList
                data={trailers}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.videoCard} onPress={() => openVideo(item.key)}>
                    <View style={styles.videoThumbnailContainer}>
                      <Image 
                        source={{ uri: `https://img.youtube.com/vi/${item.key}/hqdefault.jpg` }} 
                        style={styles.videoThumbnail} 
                      />
                      <View style={styles.playIconContainer}>
                        <Play size={24} color="#fff" fill="#fff" />
                      </View>
                    </View>
                    <Text style={styles.videoTitle} numberOfLines={1}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
              />
            </>
          )}

          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{details.overview}</Text>

          {details.belongs_to_collection && (
            <TouchableOpacity 
              style={styles.collectionButton}
              onPress={() => router.push(`/collection/${details.belongs_to_collection.id}`)}
            >
              <Text style={styles.collectionButtonText}>View Collection</Text>
            </TouchableOpacity>
          )}

          {details.images?.backdrops?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <FlatList
                data={details.images.backdrops.slice(0, 10)}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image 
                    source={{ uri: `${TMDB_IMAGE_URL}${item.file_path}` }} 
                    style={styles.galleryImage} 
                  />
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </>
          )}

          <Text style={styles.sectionTitle}>Cast</Text>
          <FlatList
            data={details.credits?.cast?.slice(0, 10)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.castCard}>
                <Image 
                  source={{ uri: item.profile_path ? `${TMDB_IMAGE_URL}${item.profile_path}` : 'https://via.placeholder.com/150?text=No+Photo' }} 
                  style={styles.castImage} 
                />
                <Text style={styles.castName} numberOfLines={1}>{item.name}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />

          <Text style={styles.sectionTitle}>Recommended</Text>
          <FlatList
            data={details.recommendations?.results}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <PosterCard item={item} type={type} />}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#fff" />
      </TouchableOpacity>
      <ListsModal 
        visible={showListsModal}
        onClose={() => setShowListsModal(false)}
        item={{
          id: details.id,
          title: details.title || details.name,
          poster_path: details.poster_path,
          type: type
        }}
        mediaType={type}
      />

      {showNotification && (
        <View style={styles.notificationContainer}>
          <View style={styles.notification}>
            <View style={styles.notificationIcon}>
              <Info size={20} color="#000" />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Login Required</Text>
              <Text style={styles.notificationMessage}>Please login to use this feature.</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
  scrollView: { 
    flex: 1,
  },
  centered: { 
    flex: 1, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  backdrop: { 
    width: '100%', 
    height: 260, 
    opacity: 0.8,
  },
  content: { 
    padding: 18, 
    marginTop: -70,
    paddingBottom: 30,
  },
  headerRow: { 
    flexDirection: 'row',
  },
  poster: { 
    width: 120, 
    height: 180, 
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
  },
  info: { 
    flex: 1, 
    marginLeft: 18, 
    justifyContent: 'flex-end',
  },
  title: { 
    color: '#fff', 
    fontSize: 26, 
    fontWeight: '800', 
    marginBottom: 10,
  },
  meta: { 
    color: '#999', 
    fontSize: 14, 
    marginBottom: 5,
    fontWeight: '500',
  },
  sectionTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '800', 
    marginTop: 28, 
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  overview: { 
    color: '#d4d4d4', 
    fontSize: 15, 
    lineHeight: 24,
    fontWeight: '400',
  },
  videoCard: {
    width: 200,
    marginRight: 14,
  },
  videoThumbnailContainer: {
    width: 200,
    height: 112,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  galleryImage: {
    width: 240,
    height: 135,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#1a1a1a',
  },
  collectionButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  collectionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  castCard: { 
    width: 90, 
    marginRight: 14, 
    alignItems: 'center',
  },
  castImage: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#1a1a1a',
  },
  castName: { 
    color: '#fff', 
    fontSize: 13, 
    marginTop: 8, 
    textAlign: 'center',
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  addToListBtn: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 4,
  },
  addToListText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionBtn: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    flex: 1,
  },
  actionText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  notificationContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  notification: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#000',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  notificationMessage: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
});
