import { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { getCustomLists, addToCustomList, removeFromCustomList, isInCustomList, createCustomList } from '../services/listService';
import { getAuthState, addToWatchlist, addToFavorites } from '../services/authService';

export default function ListsModal({ visible, onClose, item, mediaType, onAddToList }) {
  const [customLists, setCustomLists] = useState([]);
  const [listItems, setListItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [creating, setCreating] = useState(false);
  const [authState, setAuthState] = useState({ sessionId: null, account: null });
  const [defaultListItems, setDefaultListItems] = useState({ watchlist: false, favorites: false });

  useEffect(() => {
    if (visible) {
      loadInitialData();
    }
  }, [visible]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const state = await getAuthState();
      setAuthState(state);
      
      if (state.sessionId && state.account) {
        const lists = await getCustomLists(state.account.id, state.sessionId);
        setCustomLists(lists);
        
        // Fetch default lists to check membership
        const { getWatchlist, getFavorites } = require('../services/authService');
        const wl = await getWatchlist(state.account.id, state.sessionId);
        const fav = await getFavorites(state.account.id, state.sessionId);
        
        setDefaultListItems({
          watchlist: wl.some(i => i.id === item.id),
          favorites: fav.some(i => i.id === item.id)
        });

        // Check which lists contain this item
        const itemStates = {};
        for (const list of lists) {
          const isIn = await isInCustomList(list.id, item.id);
          itemStates[list.id] = isIn;
        }
        setListItems(itemStates);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (listId, isCurrentlyIn) => {
    if (!authState.sessionId) return;
    try {
      if (isCurrentlyIn) {
        await removeFromCustomList(authState.sessionId, listId, item.id);
      } else {
        await addToCustomList(authState.sessionId, listId, item.id);
      }
      
      setListItems(prev => ({
        ...prev,
        [listId]: !isCurrentlyIn
      }));

      // Update the local customLists state to reflect the new item count
      setCustomLists(prev => prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            item_count: isCurrentlyIn ? (list.item_count - 1) : (list.item_count + 1)
          };
        }
        return list;
      }));
      
      if (onAddToList) {
        onAddToList(listId, !isCurrentlyIn);
      }
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleAddToDefaultList = async (listType) => {
    if (!authState.sessionId || !authState.account) return;
    try {
      let success = false;
      if (listType === 'watchlist') {
        const isCurrentlyIn = defaultListItems.watchlist;
        success = await addToWatchlist(authState.account.id, authState.sessionId, item.id, mediaType, !isCurrentlyIn);
        if (success) setDefaultListItems(prev => ({ ...prev, watchlist: !isCurrentlyIn }));
      } else if (listType === 'favorites') {
        const isCurrentlyIn = defaultListItems.favorites;
        success = await addToFavorites(authState.account.id, authState.sessionId, item.id, mediaType, !isCurrentlyIn);
        if (success) setDefaultListItems(prev => ({ ...prev, favorites: !isCurrentlyIn }));
      }
    } catch (error) {
      console.error('Error adding to default list:', error);
    }
  };

  const handleCreateNewList = async () => {
    if (!newListName.trim() || !authState.sessionId) return;
    
    setCreating(true);
    try {
      const newList = await createCustomList(authState.sessionId, newListName);
      if (newList && newList.list_id) {
        const updatedLists = await getCustomLists(authState.account.id, authState.sessionId);
        setCustomLists(updatedLists);
        setNewListName('');
        setShowNewListInput(false);
      }
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to Collections</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <ScrollView style={styles.listContainer}>
              {/* Default Lists */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Default Lists</Text>
                
                <TouchableOpacity 
                  style={styles.listItem} 
                  onPress={() => handleAddToDefaultList('watchlist')}
                >
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>Watchlist</Text>
                    <Text style={styles.listDesc}>Movies & TV shows to watch later</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.addButton, defaultListItems.watchlist && styles.addedButton]} 
                    onPress={() => handleAddToDefaultList('watchlist')}
                  >
                    <Text style={styles.addButtonText}>
                      {defaultListItems.watchlist ? '✓ Added' : '+ Add'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.listItem} 
                  onPress={() => handleAddToDefaultList('favorites')}
                >
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>Favorites</Text>
                    <Text style={styles.listDesc}>Your favorite movies & TV shows</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.addButton, defaultListItems.favorites && styles.addedButton]} 
                    onPress={() => handleAddToDefaultList('favorites')}
                  >
                    <Text style={styles.addButtonText}>
                      {defaultListItems.favorites ? '✓ Added' : '+ Add'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              {/* Custom Lists */}
              {customLists.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Custom Lists</Text>
                  
                  {customLists.map(list => (
                    <TouchableOpacity 
                      key={list.id}
                      style={styles.listItem}
                      onPress={() => handleToggleItem(list.id, listItems[list.id])}
                    >
                      <View style={styles.listInfo}>
                        <Text style={styles.listName}>{list.name}</Text>
                        <Text style={styles.listDesc}>{list.item_count || 0} items</Text>
                      </View>
                      <TouchableOpacity 
                        style={[
                          styles.addButton, 
                          listItems[list.id] && styles.addedButton
                        ]}
                        onPress={() => handleToggleItem(list.id, listItems[list.id])}
                      >
                        <Text style={styles.addButtonText}>
                          {listItems[list.id] ? '✓ Added' : '+ Add'}
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* New List Input */}
              {showNewListInput ? (
                <View style={styles.newListInput}>
                  <TextInput
                    placeholder="List name..."
                    placeholderTextColor="#888"
                    style={styles.input}
                    value={newListName}
                    onChangeText={setNewListName}
                    autoFocus
                  />
                  <TouchableOpacity 
                    style={styles.createBtn}
                    onPress={handleCreateNewList}
                    disabled={creating}
                  >
                    <Text style={styles.createBtnText}>
                      {creating ? 'Creating...' : 'Create'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelBtn}
                    onPress={() => {
                      setShowNewListInput(false);
                      setNewListName('');
                    }}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.newListButton}
                  onPress={() => setShowNewListInput(true)}
                >
                  <Plus size={18} color="#fff" />
                  <Text style={styles.newListButtonText}>Create New List</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  centered: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    marginLeft: 4,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  listDesc: {
    fontSize: 12,
    color: '#888',
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  addedButton: {
    backgroundColor: '#28a745',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  newListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#444',
    marginTop: 8,
  },
  newListButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  newListInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0a0a0a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  createBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 8,
  },
  createBtnText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  cancelBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});
