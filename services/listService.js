import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TMDB_API_KEY = '0ade7493088bba625255d27ba157788c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const apiClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: { api_key: TMDB_API_KEY }
});

export const createCustomList = async (sessionId, name, description = '') => {
  try {
    const response = await apiClient.post('/list', 
      { name, description, language: 'en' },
      { params: { session_id: sessionId } }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating TMDB list:', error);
    return null;
  }
};

export const getCustomLists = async (accountId, sessionId) => {
  try {
    const response = await apiClient.get(`/account/${accountId}/lists`, {
      params: { session_id: sessionId }
    });
    // TMDB account lists response includes 'item_count' for each list
    return response.data.results || [];
  } catch (error) {
    console.error('Error getting TMDB lists:', error);
    return [];
  }
};

export const deleteCustomList = async (sessionId, listId) => {
  try {
    await apiClient.delete(`/list/${listId}`, {
      params: { session_id: sessionId }
    });
    return true;
  } catch (error) {
    console.error('Error deleting TMDB list:', error);
    return false;
  }
};

export const addToCustomList = async (sessionId, listId, mediaId) => {
  try {
    const response = await apiClient.post(`/list/${listId}/add_item`, 
      { media_id: mediaId },
      { params: { session_id: sessionId } }
    );
    return response.data.success;
  } catch (error) {
    console.error('Error adding to TMDB list:', error);
    return false;
  }
};

export const removeFromCustomList = async (sessionId, listId, mediaId) => {
  try {
    const response = await apiClient.post(`/list/${listId}/remove_item`, 
      { media_id: mediaId },
      { params: { session_id: sessionId } }
    );
    return response.data.success;
  } catch (error) {
    console.error('Error removing from TMDB list:', error);
    return false;
  }
};

export const getCustomListItems = async (listId) => {
  try {
    const response = await apiClient.get(`/list/${listId}`);
    return response.data.items || [];
  } catch (error) {
    console.error('Error getting TMDB list items:', error);
    return [];
  }
};

export const isInCustomList = async (listId, itemId) => {
  try {
    const items = await getCustomListItems(listId);
    return items.some(i => i.id === itemId);
  } catch (error) {
    return false;
  }
};

export const getDefaultListsState = () => ({
  watchlist: { name: 'Watchlist', icon: 'bookmark', items: [] },
  favorites: { name: 'Favorites', icon: 'heart', items: [] }
});
