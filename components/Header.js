import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList, Modal, Pressable, Linking } from 'react-native';
import { Search, UserCircle, XCircle, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { searchContent } from '../services/tmdbApi';
import { getAuthState } from '../services/authService';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const auth = await getAuthState();
    setIsLoggedIn(!!auth.sessionId);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    setIsSearching(true);
    const data = await searchContent(query);
    setResults(data.filter(item => item.media_type !== 'person').slice(0, 10));
    setShowResults(true);
    setIsSearching(false);
  };

  const handleSelect = (item) => {
    setShowResults(false);
    setQuery('');
    router.push({
      pathname: '/details',
      params: { id: item.id, type: item.media_type }
    });
  };

  const handleProfilePress = () => {
    if (isLoggedIn) {
      router.push('/profile');
      setShowProfileMenu(false);
    } else {
      setShowProfileMenu(true);
    }
  };

  const handleLoginTMDB = async () => {
    const { getRequestTokenUrl } = require('../services/authService');
    const url = await getRequestTokenUrl();
    if (url) {
      try {
        await Linking.openURL(url);
        setShowProfileMenu(false);
      } catch (err) {
        console.error('Failed to open TMDB:', err);
      }
    }
  };

  return (
    <View style={[styles.container, { zIndex: 100 }]}>
      <View style={styles.topRow}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder} />
          <Text style={styles.brandName}>Beenama</Text>
        </View>
        <TouchableOpacity onPress={handleProfilePress}>
          {isLoggedIn ? (
            <UserCircle size={24} color="#fff" />
          ) : (
            <UserCircle size={24} color="#888" />
          )}
        </TouchableOpacity>
      </View>

      {showProfileMenu && !isLoggedIn && (
        <Modal visible={showProfileMenu} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setShowProfileMenu(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sign in to TMDB</Text>
              <Text style={styles.modalDesc}>Sign in with your TMDB account to manage your personal collections</Text>
              <TouchableOpacity style={styles.modalButton} onPress={handleLoginTMDB}>
                <Text style={styles.modalButtonText}>Open TMDB</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowProfileMenu(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
      <View style={styles.searchBar}>
        <Search size={16} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search movies, TV shows..."
          placeholderTextColor="#888"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => query.trim() && setShowResults(true)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setShowResults(false); }}>
            <XCircle size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {showResults && (
        <View style={styles.resultsOverlay}>
          <Pressable style={styles.dismissArea} onPress={() => setShowResults(false)} />
          <View style={styles.resultsContainer}>
            <FlatList
              data={results}
              keyExtractor={(item) => `${item.media_type}-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w92${item.poster_path}` }}
                    style={styles.resultPoster}
                  />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={1}>
                      {item.title || item.name}
                    </Text>
                    <Text style={styles.resultMeta}>
                      {item.media_type.toUpperCase()} • {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !isSearching && <Text style={styles.noResults}>No results found for "{query}"</Text>
              }
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: '80%',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: '#d4d4d4',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  modalCloseBtn: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 12,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    paddingBottom: 12,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginRight: 10,
  },
  brandName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 101,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    outlineStyle: 'none',
  },
  resultsOverlay: {
    position: 'absolute',
    top: 150, // Significantly increased to clear search input + breathing room
    left: 0,
    right: 0,
    bottom: -500,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    zIndex: 99,
  },
  dismissArea: {
    position: 'absolute',
    top: -140, // Extend dismiss area up to cover the gap
    left: 0,
    right: 0,
    bottom: 0,
  },
  resultsContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    marginTop: 0,
    maxHeight: 350, // Reduced height for better fit on Android
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    alignItems: 'center',
  },
  resultPoster: {
    width: 40,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultMeta: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  noResults: {
    color: '#888',
    textAlign: 'center',
    padding: 20,
  },
});
