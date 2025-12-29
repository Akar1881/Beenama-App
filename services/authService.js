import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TMDB_API_KEY = '0ade7493088bba625255d27ba157788c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const authClient = axios.create({
  baseURL: TMDB_BASE_URL,
});

// AUTH FUNCTIONS
export const createRequestToken = async () => {
  try {
    const response = await authClient.get('/authentication/token/new', {
      params: { api_key: TMDB_API_KEY }
    });
    return response.data.request_token;
  } catch (error) {
    console.error('Error creating request token:', error);
    return null;
  }
};

export const validateRequestToken = async (requestToken) => {
  try {
    // For web/mobile testing, we simulate approval since we can't do real OAuth redirect
    // In production, this would be the callback from TMDB after user approval
    return requestToken;
  } catch (error) {
    console.error('Error validating request token:', error);
    return null;
  }
};

export const createSessionId = async (requestToken) => {
  try {
    const response = await authClient.post('/authentication/session/new', 
      { request_token: requestToken },
      { params: { api_key: TMDB_API_KEY } }
    );
    if (response.data.success) {
      return response.data.session_id;
    }
    return null;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
};

export const getAccountDetails = async (sessionId) => {
  try {
    const response = await authClient.get('/account', {
      params: { 
        api_key: TMDB_API_KEY,
        session_id: sessionId 
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching account details:', error);
    return null;
  }
};

// WATCHLIST/FAVORITES - TMDB Default Lists
export const getWatchlist = async (accountId, sessionId) => {
  try {
    const [movies, tv] = await Promise.all([
      authClient.get(`/account/${accountId}/watchlist/movies`, {
        params: { api_key: TMDB_API_KEY, session_id: sessionId }
      }),
      authClient.get(`/account/${accountId}/watchlist/tv`, {
        params: { api_key: TMDB_API_KEY, session_id: sessionId }
      })
    ]);
    
    const movieList = (movies.data.results || []).map(item => ({ ...item, media_type: 'movie' }));
    const tvList = (tv.data.results || []).map(item => ({ ...item, media_type: 'tv' }));
    
    return [...movieList, ...tvList];
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
};

export const getFavorites = async (accountId, sessionId) => {
  try {
    const [movies, tv] = await Promise.all([
      authClient.get(`/account/${accountId}/favorite/movies`, {
        params: { api_key: TMDB_API_KEY, session_id: sessionId }
      }),
      authClient.get(`/account/${accountId}/favorite/tv`, {
        params: { api_key: TMDB_API_KEY, session_id: sessionId }
      })
    ]);
    
    const movieList = (movies.data.results || []).map(item => ({ ...item, media_type: 'movie' }));
    const tvList = (tv.data.results || []).map(item => ({ ...item, media_type: 'tv' }));
    
    return [...movieList, ...tvList];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

export const addToWatchlist = async (accountId, sessionId, mediaId, mediaType, shouldAdd = true) => {
  try {
    const response = await authClient.post(`/account/${accountId}/watchlist`, 
      {
        media_type: mediaType,
        media_id: mediaId,
        watchlist: shouldAdd
      },
      { 
        params: { 
          api_key: TMDB_API_KEY,
          session_id: sessionId 
        }
      }
    );
    return response.data.success;
  } catch (error) {
    console.error('Error updating watchlist:', error.response?.data || error.message);
    return false;
  }
};

export const addToFavorites = async (accountId, sessionId, mediaId, mediaType, shouldAdd = true) => {
  try {
    const response = await authClient.post(`/account/${accountId}/favorite`, 
      {
        media_type: mediaType,
        media_id: mediaId,
        favorite: shouldAdd
      },
      { 
        params: { 
          api_key: TMDB_API_KEY,
          session_id: sessionId 
        }
      }
    );
    return response.data.success;
  } catch (error) {
    console.error('Error updating favorites:', error.response?.data || error.message);
    return false;
  }
};

// LOCAL STORAGE FOR AUTH STATE
export const saveAuthState = async (sessionId, accountData) => {
  try {
    await AsyncStorage.setItem('tmdb_session_id', sessionId);
    await AsyncStorage.setItem('tmdb_account', JSON.stringify(accountData));
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
};

export const getAuthState = async () => {
  try {
    const sessionId = await AsyncStorage.getItem('tmdb_session_id');
    const accountStr = await AsyncStorage.getItem('tmdb_account');
    const account = accountStr ? JSON.parse(accountStr) : null;
    return { sessionId, account };
  } catch (error) {
    console.error('Error retrieving auth state:', error);
    return { sessionId: null, account: null };
  }
};

export const clearAuthState = async () => {
  try {
    await AsyncStorage.removeItem('tmdb_session_id');
    await AsyncStorage.removeItem('tmdb_account');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
};

export const getRequestTokenUrl = async () => {
  const token = await createRequestToken();
  if (token) {
    // Detect if running on web or mobile/app
    let redirectUrl;
    if (typeof window !== 'undefined') {
      // Web environment - use http localhost
      redirectUrl = window.location.origin + '/profile';
    } else {
      // Mobile/Native app - use deep link scheme from app.json
      redirectUrl = 'beenama://profile';
    }
    return `https://www.themoviedb.org/authenticate/${token}?redirect_to=${encodeURIComponent(redirectUrl)}`;
  }
  return null;
};
