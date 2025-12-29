import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchPopular } from '../../services/tmdbApi';
import Header from '../../components/Header';
import PosterCard from '../../components/PosterCard';
import FilterModal from '../../components/FilterModal';
import { FontAwesome } from '@expo/vector-icons';

export default function MoviesScreen() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    sort_by: 'popularity.desc',
    include_adult: false,
    with_genres: [],
    primary_release_year: null
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMovies();
  }, [page, filters]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await fetchPopular('movie', page, filters);
      setMovies(page === 1 ? data : [...movies, ...data]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setShowFilters(false);
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.filterRow}>
        <Text style={styles.title}>Explore Movies</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(true)}>
          <FontAwesome name="sliders" size={18} color="#fff" />
          <Text style={styles.filterText}>Sort & Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={movies}
        numColumns={3}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PosterCard item={item} size="small" />}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={() => setPage(page + 1)}
        ListFooterComponent={loading && <ActivityIndicator color="#fff" />}
      />

      <FilterModal 
        visible={showFilters} 
        onClose={() => setShowFilters(false)}
        onApply={applyFilters}
        onReset={applyFilters}
        currentFilters={filters}
        type="movie"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
  filterRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '800',
  },
  filterBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1a1a1a', 
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterText: { 
    color: '#fff', 
    marginLeft: 10, 
    fontSize: 14,
    fontWeight: '600',
  },
  list: { 
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#1a1a1a', 
    padding: 20, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20 
  },
  modalTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  optBtn: { 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#333' 
  },
  optText: { 
    color: '#888', 
    fontSize: 16 
  },
  closeBtn: { 
    marginTop: 20, 
    alignItems: 'center', 
    padding: 15 
  },
  closeText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
});
