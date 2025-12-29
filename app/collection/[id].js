import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { fetchCollection } from '../../services/tmdbApi';
import PosterCard from '../../components/PosterCard';

export default function CollectionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollection();
  }, [id]);

  const loadCollection = async () => {
    const data = await fetchCollection(id);
    if (data && data.parts) {
      // Sort parts by release date
      data.parts.sort((a, b) => {
        const dateA = a.release_date || '9999';
        const dateB = b.release_date || '9999';
        return dateA.localeCompare(dateB);
      });
    }
    setCollection(data);
    setLoading(false);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#fff" /></View>;
  if (!collection) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{collection.name}</Text>
        </View>
      </View>

      <FlatList
        data={collection.parts}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PosterCard item={item} type="movie" size="small" />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  listContent: {
    padding: 8,
  },
  cardWrapper: {
    flex: 1/3,
    padding: 4,
  }
});
