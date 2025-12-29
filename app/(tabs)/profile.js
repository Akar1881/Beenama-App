import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { LogOut, Bookmark, Heart, Folder, User, Trash2 } from 'lucide-react-native';
import { getAuthState, clearAuthState, createSessionId, getAccountDetails, saveAuthState, getRequestTokenUrl, getWatchlist, getFavorites } from '../../services/authService';
import { getCustomLists, deleteCustomList } from '../../services/listService';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [authState, setAuthState] = useState({ sessionId: null, account: null });
  const [customLists, setCustomLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultCounts, setDefaultCounts] = useState({ watchlist: 0, favorites: 0 });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfileData();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (params.request_token && params.approved === 'true') {
      handleAuthCallback(params.request_token);
    } else {
      loadProfileData();
    }
  }, [params.request_token, params.approved]);

  const handleAuthCallback = async (requestToken) => {
    setLoading(true);
    try {
      const sessionId = await createSessionId(requestToken);
      if (sessionId) {
        const account = await getAccountDetails(sessionId);
        await saveAuthState(sessionId, account);
        setAuthState({ sessionId, account });
        loadProfileData();
      }
    } catch (error) {
      console.error('Auth callback error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const url = await getRequestTokenUrl();
      console.log('Login URL:', url);
      if (url) {
        // Use window.open for web, Linking for native
        if (typeof window !== 'undefined') {
          window.open(url, '_blank');
        } else {
          Linking.openURL(url);
        }
      } else {
        console.error('No URL generated for login');
        alert('Failed to generate login URL. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error during login: ' + error.message);
    }
  };

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const state = await getAuthState();
      setAuthState(state);
      
      if (state.sessionId && state.account) {
        // Fetch custom lists
        const lists = await getCustomLists(state.account.id, state.sessionId);
        setCustomLists(lists);

        // Fetch default list counts
        const wl = await getWatchlist(state.account.id, state.sessionId);
        const fav = await getFavorites(state.account.id, state.sessionId);
        
        setDefaultCounts({
          watchlist: wl.length,
          favorites: fav.length
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await clearAuthState();
      setAuthState({ sessionId: null, account: null });
      setCustomLists([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await deleteCustomList(authState.sessionId, listId);
      setCustomLists(customLists.filter(l => l.id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color="#fff" />
        </View>
      </View>
    );
  }

  if (!authState.sessionId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        
        <View style={styles.loginPrompt}>
          <View style={styles.iconBox}>
            <User size={40} color="#fff" />
          </View>
          <Text style={styles.loginTitle}>Not Logged In</Text>
          <Text style={styles.loginDesc}>
            Sign in with your TMDB account to manage your watchlist, favorites, and custom collections
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign in with TMDB</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <LogOut size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Account Info */}
        <View style={styles.accountSection}>
          <View style={styles.avatar}>
            <User size={36} color="#fff" />
          </View>
          <Text style={styles.username}>{authState.account?.name || authState.account?.username}</Text>
          <Text style={styles.email}>{authState.account?.username}</Text>
        </View>

        {/* Default Lists Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Collections</Text>
          
          <TouchableOpacity 
            style={styles.listCard}
            onPress={() => router.push({
              pathname: '/profile/list',
              params: { name: 'Watchlist', type: 'watchlist' }
            })}
          >
            <View style={styles.listIcon}>
              <Bookmark size={24} color="#fff" fill="#fff" />
            </View>
            <View style={styles.listCardInfo}>
              <Text style={styles.listCardName}>Watchlist</Text>
              <Text style={styles.listCardDesc}>Movies & TV shows to watch later</Text>
            </View>
            <Text style={styles.listCardCount}>{defaultCounts.watchlist}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.listCard}
            onPress={() => router.push({
              pathname: '/profile/list',
              params: { name: 'Favorites', type: 'favorites' }
            })}
          >
            <View style={styles.listIcon}>
              <Heart size={24} color="#fff" fill="#fff" />
            </View>
            <View style={styles.listCardInfo}>
              <Text style={styles.listCardName}>Favorites</Text>
              <Text style={styles.listCardDesc}>Your favorite movies & TV shows</Text>
            </View>
            <Text style={styles.listCardCount}>{defaultCounts.favorites}</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Lists Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Collections ({customLists.length})</Text>
          
          {customLists.length === 0 ? (
            <Text style={styles.emptyText}>No custom lists yet. Create one to organize your content!</Text>
          ) : (
            customLists.map(list => (
              <TouchableOpacity 
                key={list.id}
                style={styles.listCard}
                onPress={() => router.push({
                  pathname: '/profile/list',
                  params: { name: list.name, id: list.id, type: 'custom' }
                })}
              >
                <View style={styles.listIcon}>
                  <Folder size={24} color="#fff" fill="#fff" />
                </View>
                <View style={styles.listCardInfo}>
                  <Text style={styles.listCardName}>{list.name}</Text>
                  {list.description ? (
                    <Text style={styles.listCardDesc} numberOfLines={1}>{list.description}</Text>
                  ) : (
                    <Text style={styles.listCardDesc}>Custom Collection</Text>
                  )}
                </View>
                <View style={styles.listCardRight}>
                  <Text style={styles.listCardCount}>{list.item_count || 0}</Text>
                  <TouchableOpacity 
                    onPress={() => handleDeleteList(list.id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={16} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.spacing} />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  loginDesc: {
    fontSize: 14,
    color: '#d4d4d4',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  accountSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  listIcon: {
    marginRight: 14,
  },
  listCardInfo: {
    flex: 1,
  },
  listCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  listCardDesc: {
    fontSize: 12,
    color: '#888',
  },
  listCardCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginRight: 12,
  },
  listCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  spacing: {
    height: 30,
  },
});
