import axios from 'axios';

const TMDB_API_KEY = '0ade7493088bba625255d27ba157788c'; // Demo Key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const apiClient = axios.create({
  baseURL: TMDB_BASE_URL,
});

// Add request interceptor to always include the API key
apiClient.interceptors.request.use(
  (config) => {
    config.params = {
      ...config.params,
      api_key: TMDB_API_KEY,
    };
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 and log errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('TMDB API Key is invalid or expired. Please provide your own key in services/tmdbApi.js');
    }
    return Promise.reject(error);
  }
);

export const fetchTrending = async (mediaType = 'movie', timeWindow = 'week') => {
  try {
    const response = await apiClient.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

export const fetchUpcoming = async (mediaType = 'movie') => {
  try {
    const response = await apiClient.get(`/${mediaType}/upcoming`);
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching upcoming:', error);
    return [];
  }
};

export const fetchMovies = async (page = 1) => {
  try {
    const response = await apiClient.get('/discover/movie', { params: { page } });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

export const fetchTVShows = async (page = 1) => {
  try {
    const response = await apiClient.get('/discover/tv', { params: { page } });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return [];
  }
};

export const fetchAnime = async (page = 1, filters = {}) => {
  try {
    const params = {
      page,
      sort_by: filters.sort_by || 'popularity.desc',
      include_adult: false,
      with_genres: 16, // Animation
      with_keywords: '210024|287501', // Anime or Manga keywords
      with_original_language: 'ja',
      ...(filters.primary_release_year && { first_air_date_year: filters.primary_release_year })
    };
    const response = await apiClient.get('/discover/tv', { params });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching anime:', error);
    return [];
  }
};

export const fetchTopRated = async (mediaType = 'movie') => {
  try {
    const response = await apiClient.get(`/${mediaType}/top_rated`);
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching top rated:', error);
    return [];
  }
};

export const fetchPopular = async (mediaType = 'movie', page = 1, filters = {}) => {
  try {
    const params = {
      page,
      sort_by: filters.sort_by || 'popularity.desc',
      include_adult: true,
      with_genres: filters.with_genres?.length > 0 ? filters.with_genres.join(',') : undefined,
      ...(mediaType === 'movie' 
        ? { primary_release_year: filters.primary_release_year } 
        : { first_air_date_year: filters.primary_release_year })
    };
    const response = await apiClient.get(`/discover/${mediaType}`, { params });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching popular:', error);
    return [];
  }
};

export const searchContent = async (query) => {
  try {
    const response = await apiClient.get('/search/multi', {
      params: { query }
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error searching content:', error);
    return [];
  }
};

export const fetchSimilarByGenres = async (mediaType, genreIds) => {
  try {
    const response = await apiClient.get(`/discover/${mediaType}`, {
      params: {
        with_genres: genreIds.join(','),
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching similar by genres:', error);
    return [];
  }
};

export const fetchCollection = async (id) => {
  try {
    const response = await apiClient.get(`/collection/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
};

export const fetchDetails = async (mediaType, id) => {
  try {
    const response = await apiClient.get(`/${mediaType}/${id}`, {
      params: { append_to_response: 'credits,recommendations,videos,images,seasons' }
    });
    let data = response.data;
    
    // Fallback: If no recommendations, fetch similar by genres
    if (!data.recommendations?.results?.length && data.genres?.length) {
      const genreIds = data.genres.map(g => g.id);
      const similar = await fetchSimilarByGenres(mediaType, genreIds);
      // Filter out current item
      data.recommendations = {
        results: similar.filter(item => item.id.toString() !== id.toString())
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching details:', error);
    return null;
  }
};

export const fetchSeasonDetails = async (tvId, seasonNumber) => {
  try {
    const response = await apiClient.get(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching season details:', error);
    return null;
  }
};
