import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, FlatList, Modal, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Play, ChevronDown, Star, Calendar, Clock } from 'lucide-react-native';
import { fetchDetails, fetchSeasonDetails } from '../../services/tmdbApi';
import VideoPlayer from '../../components/Player/VideoPlayer';

const { width: screenWidth } = Dimensions.get('window');
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

export default function WatchScreen() {
  const { id, type, title, poster, s, e } = useLocalSearchParams();
  const router = useRouter();
  const [details, setDetails] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(parseInt(s) || 1);
  const [seasonData, setSeasonData] = useState(null);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(parseInt(e) || 1);
  const [playing, setPlaying] = useState(false);
   // hls file
   const MOCK_HLS = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';
  
  const MOCK_SUB = 'https://gist.githubusercontent.com/samdutton/ca37f3adaf4e23679957b8083e061177/raw/e19399fbccbc069a2af4266e5120ae6bad62699a/sample.vtt';

  useEffect(() => {
    loadDetails();
  }, [id]);

  useEffect(() => {
    if (type === 'tv' && selectedSeason) {
      loadSeasonDetails();
    }
  }, [selectedSeason]);

  const updateParams = (newSeason, newEpisode) => {
    router.setParams({ s: newSeason.toString(), e: newEpisode.toString() });
  };

  const handleSeasonSelect = (seasonNumber) => {
    setSelectedSeason(seasonNumber);
    setCurrentEpisode(1);
    setPlaying(false);
    updateParams(seasonNumber, 1);
    setShowSeasonModal(false);
  };

  const handleEpisodeSelect = (episodeNumber) => {
    setCurrentEpisode(episodeNumber);
    setPlaying(false);
    updateParams(selectedSeason, episodeNumber);
  };

  const loadDetails = async () => {
    const data = await fetchDetails(type, id);
    setDetails(data);
    if (type === 'tv' && data.seasons?.length > 0 && !s) {
      // Find first normal season only if not provided in params
      const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
      setSelectedSeason(firstSeason.season_number);
      updateParams(firstSeason.season_number, 1);
    }
  };

  const loadSeasonDetails = async () => {
    const data = await fetchSeasonDetails(id, selectedSeason);
    setSeasonData(data);
  };

  const calculateAirDate = (airDate) => {
    if (!airDate) return 'TBA';
    const today = new Date();
    const release = new Date(airDate);
    const diffTime = release - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return null;
    return `will air in ${diffDays}d`;
  };

  const renderEpisode = ({ item }) => {
    const airStatus = calculateAirDate(item.air_date);
    const isAired = !airStatus;

    return (
      <TouchableOpacity 
        key={item.id}
        style={[
          styles.episodeCard,
          currentEpisode === item.episode_number && styles.activeEpisodeCard
        ]}
        onPress={() => isAired && handleEpisodeSelect(item.episode_number)}
        disabled={!isAired}
      >
        <Image 
          source={{ uri: item.still_path ? `${TMDB_IMAGE_URL}${item.still_path}` : `${TMDB_IMAGE_URL}${poster}` }} 
          style={[styles.episodeThumb, !isAired && { opacity: 0.5 }]} 
        />
        <View style={styles.episodeInfo}>
          <Text style={[
            styles.episodeTitle,
            currentEpisode === item.episode_number && styles.activeEpisodeTitle
          ]} numberOfLines={1}>{item.name}</Text>
          {isAired ? (
            <View style={styles.episodeMeta}>
              <Star size={12} color={currentEpisode === item.episode_number ? "#fff" : "#999"} fill={currentEpisode === item.episode_number ? "#fff" : "#999"} />
              <Text style={[
                styles.episodeRating,
                currentEpisode === item.episode_number && { color: '#fff' }
              ]}>{item.vote_average?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.episodeSeparator}>•</Text>
              <Text style={[
                styles.episodeRuntime,
                currentEpisode === item.episode_number && { color: '#fff' }
              ]}>{item.runtime || '--'}m</Text>
            </View>
          ) : (
            <Text style={styles.airDate}>{item.air_date} • {airStatus}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>

      <ScrollView style={styles.content}>
        {playing ? (
          <View style={styles.iframeCard}>
            <VideoPlayer 
              source={MOCK_HLS} 
              subtitleUrl={MOCK_SUB}
              title={type === 'tv' ? `${title} - S${selectedSeason}E${currentEpisode}` : title}
              onBack={() => setPlaying(false)}
            />
          </View>
        ) : (
          <View style={styles.iframeCard}>
            <Image 
              source={{ uri: `${TMDB_IMAGE_URL}${poster}` }} 
              style={styles.iframeImage} 
            />
            <View style={styles.iframeOverlay}>
              <TouchableOpacity style={styles.watchCenterBtn} onPress={() => setPlaying(true)}>
                <Play size={32} color="#000" fill="#000" />
                <Text style={styles.watchCenterText}>
                  WATCH {type === 'tv' ? `S:${selectedSeason} E:${currentEpisode}` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {type === 'tv' && (
          <View style={styles.tvSection}>
            <TouchableOpacity 
              style={styles.seasonSelector}
              onPress={() => setShowSeasonModal(true)}
            >
              <Text style={styles.seasonSelectorText}>Season {selectedSeason}</Text>
              <ChevronDown size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.episodeListContainer}>
              {(seasonData?.episodes || []).map((item) => renderEpisode({ item }))}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showSeasonModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSeasonModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSeasonModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Season</Text>
            <ScrollView>
              {(details?.seasons?.filter(s => s.season_number > 0) || []).map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={[
                    styles.seasonItem,
                    selectedSeason === item.season_number && styles.selectedSeasonItem
                  ]}
                  onPress={() => handleSeasonSelect(item.season_number)}
                >
                  <Text style={[
                    styles.seasonItemText,
                    selectedSeason === item.season_number && styles.selectedSeasonItemText
                  ]}>
                    Season {item.season_number} ({item.episode_count} Episodes)
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
  },
  playerWrapper: {
    width: screenWidth,
    aspectRatio: 16/9,
    backgroundColor: '#000',
    marginTop: 20,
  },
  iframeCard: {
    width: screenWidth - 36,
    aspectRatio: 4/5,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  iframeImage: {
    width: '100%',
    height: '100%',
  },
  iframeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchCenterBtn: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  watchCenterText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  tvSection: {
    padding: 18,
  },
  seasonSelector: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  seasonSelectorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  episodeListContainer: {
    marginBottom: 20,
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  activeEpisodeCard: {
    borderColor: '#fff',
    backgroundColor: '#1a1a1a',
  },
  episodeThumb: {
    width: 120,
    height: 80,
    backgroundColor: '#1a1a1a',
  },
  episodeInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  activeEpisodeTitle: {
    color: '#fff',
    fontWeight: '900',
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  episodeRating: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  episodeSeparator: {
    color: '#333',
    marginHorizontal: 2,
  },
  episodeRuntime: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  airDate: {
    color: '#999',
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  seasonItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  selectedSeasonItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  seasonItemText: {
    color: '#d4d4d4',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedSeasonItemText: {
    color: '#fff',
    fontWeight: '800',
  },
});
