import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Filter } from 'lucide-react-native';
import { getWatchlist, getFavorites, getAuthState } from '../../services/authService';
import { getCustomListItems } from '../../services/listService';
import PosterCard from '../../components/PosterCard';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;

export default function ListDetailScreen() {
  const { name, id, type: listType } = useLocalSearchParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, movie, tv

  useEffect(() => {
    loadListItems();
  }, [id, listType]);

  const loadListItems = async () => {
    setLoading(true);
    try {
      const state = await getAuthState();
      let data = [];
      
      if (listType === 'watchlist') {
        data = await getWatchlist(state.account.id, state.sessionId);
      } else if (listType === 'favorites') {
        data = await getFavorites(state.account.id, state.sessionId);
      } else if (id) {
        data = await getCustomListItems(id);
      }
      
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error loading list items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => {
        // Handle both item.media_type and item.type (some APIs differ)
        const type = item.media_type || item.type;
        return type === filter;
      }));
    }
  }, [filter, items]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filterBar}>
        {['all', 'movie', 'tv'].map((f) => (
          <TouchableOpacity 
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredItems}
        numColumns={COLUMN_COUNT}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <PosterCard 
              item={item} 
              type={item.media_type || item.type || (filter === 'all' ? 'movie' : filter)} 
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerRight: {
    width: 40,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterBtnActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  filterText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  cardContainer: {
    flex: 1/COLUMN_COUNT,
    padding: 5,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});
