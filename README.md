# Beenama - Android Movie Streaming App

> A cinematic React Native streaming application for discovering and managing movies, TV shows, and anime content with TMDB integration.

**Version**: 1.0.0 | **Status**: Production Ready | **License**: Private

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Configuration](#configuration)
7. [Usage Guide](#usage-guide)
8. [Architecture](#architecture)
9. [API Reference](#api-reference)
10. [Building & Deployment](#building--deployment)
11. [Styling Guidelines](#styling-guidelines)
12. [Development](#development)
13. [Troubleshooting](#troubleshooting)
14. [FAQ](#faq)
15. [Contributing](#contributing)
16. [Roadmap](#roadmap)

---

## Overview

Beenama is a modern, cinematic Android streaming application built with React Native and Expo. It provides a seamless experience for discovering and managing movies, TV shows, and anime content. The app features:

- **Dark, cinematic UI** - Black & white theme optimized for content discovery
- **TMDB Integration** - Access to millions of movies and TV shows
- **User Authentication** - Secure sign-in with TMDB accounts
- **Smart Collections** - Organize content into default lists (Watchlist, Favorites) and unlimited custom collections
- **Cross-Platform Support** - Works on Android, iOS, and Web
- **Video Playback** - Native video player with support for multiple formats

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React Native | 0.81.5 |
| **Expo SDK** | Expo | 54.0.30 |
| **Routing** | Expo Router | 6.0.21 |
| **HTTP Client** | Axios | 1.13.2 |
| **State/Storage** | AsyncStorage | 1.24.0 |
| **Icons** | Lucide React Native | 0.562.0 |
| **Build Service** | EAS Build | 16.28.0 |

---

## Features

### Core Features

#### 1. **Home Screen** 🏠
- Trending content carousel featuring current popular movies and TV shows
- Mixed content display (movies + TV shows)
- Quick navigation to other sections
- Auto-refreshing content on app focus

#### 2. **Movies Discovery** 🎬
- Browse thousands of movies
- Advanced filtering by:
  - Genre (Action, Comedy, Drama, Horror, etc.)
  - Release year (past 20+ years)
  - Popularity & ratings
- Pagination for smooth scrolling
- Search functionality across all movies
- Poster previews with ratings

#### 3. **TV Shows Discovery** 📺
- Extensive TV show catalog
- Filter by genre and status
- Episode information
- Show ratings and reviews
- Watchlist integration

#### 4. **Anime Collection** 🎌
- Curated anime content (Animation genre)
- Japanese language filtering
- Seasonal releases
- Rating information

#### 5. **Details Page** 📖
- Comprehensive content information:
  - Overview and synopsis
  - Cast and crew
  - Release dates
  - Genre tags
  - Ratings (TMDB & user)
  - Runtime information
  - Recommendations
- **+ Add to List** button for quick list management
- Add to Watchlist
- Add to Favorites
- Add to custom collections

#### 6. **Profile & Authentication** 👤
- **TMDB OAuth Sign-In**
  - Secure authentication
  - Persistent session storage
  - Account information display
  
- **Default Collections**
  - **Watchlist**: Movies to watch later
  - **Favorites**: Your favorite content
  - Real-time sync with TMDB account
  
- **Custom Collections**
  - Create unlimited personal lists
  - Full CRUD operations (Create, Read, Update, Delete)
  - Organize by theme, mood, genre, etc.
  - Local persistence (survives app restarts)
  - Item count display

#### 7. **Video Player** 🎥
- Native video playback
- Support for multiple formats:
  - HLS streams (.m3u8)
  - MKV files
  - MP4 and other common formats
- Subtitle support (VTT format)
- Playback controls (play, pause, seek, volume)
- Full-screen capability

#### 8. **Dark Theme** 🌙
- Cinematic black & white aesthetic
- High contrast for readability
- Smooth animations throughout
- Responsive design for all screen sizes

---

## Quick Start

### For Web Preview
```bash
npm install
npm run web
# Opens at http://localhost:5000
```

### For Android (Expo Go)
```bash
npm install
npm run android
# Scans QR code with Expo Go app on your device
```

### For APK Build
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Build APK
eas build --platform android
# Select "preview" profile when prompted
```

---

## Project Structure

```
beenama/
├── app/                              # Expo Router app directory (file-based routing)
│   ├── _layout.js                    # Root navigation setup
│   ├── (tabs)/                       # Tab-based navigation group
│   │   ├── _layout.js                # Tab configuration (5 tabs)
│   │   ├── index.js                  # Home screen - Trending content
│   │   ├── movies.js                 # Movies discovery & filtering
│   │   ├── tvshows.js                # TV shows discovery & filtering
│   │   ├── anime.js                  # Anime (animation genre) content
│   │   ├── profile.js                # User profile & collections
│   │   ├── details.js                # Movie/TV details page
│   │   └── collection/[id].js        # Custom collection details (dynamic route)
│   └── watch/
│       └── index.js                  # Video player screen
│
├── components/                       # Reusable React components
│   ├── Header.js                     # Top header with search & profile
│   ├── PosterCard.js                 # Movie/TV poster card component
│   ├── FilterModal.js                # Genre/filter selection modal
│   ├── ListsModal.js                 # Add-to-list management modal
│   ├── Player/
│   │   └── VideoPlayer.js            # Video player component
│   └── RatingModal.js                # Rating/review modal
│
├── services/                         # API & business logic services
│   ├── tmdbApi.js                    # TMDB API client & endpoints
│   ├── authService.js                # Authentication & session management
│   └── listService.js                # Custom list management & persistence
│
├── constants/                        # App constants
│   └── (API keys, URLs, etc.)
│
├── package.json                      # Dependencies & scripts
├── app.json                          # Expo configuration (includes EAS settings)
├── eas.json                          # EAS Build configuration
├── replit.md                         # Internal development notes
├── CONTRIBUTION.md                   # Styling & contribution guidelines
└── README.md                         # This file

```

### Key Directories Explained

**`app/`** - Expo Router uses file-based routing. Each `.js` file becomes a route.
- `(tabs)` - Grouped routes that all use tab navigation
- `watch/` - Separate layout for video player screen

**`components/`** - Reusable UI components used across screens

**`services/`** - Handles API calls, authentication, and data persistence

---

## Installation & Setup

### Prerequisites

- **Node.js** 14+ (tested with 16.x)
- **npm** or **yarn**
- **Expo Go app** (for testing on device)
- **Android SDK** (for native Android builds, optional)
- **Git** (for version control)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd beenama-app

# Install dependencies
npm install

# If you encounter issues
npm ci  # Clean install using package-lock.json
```

### Step 2: Get TMDB API Key

1. Visit [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Sign up for a free TMDB account (if you don't have one)
3. Create an API key
4. Copy the API key

### Step 3: Configure API Key

**For Development:**
```javascript
// In services/tmdbApi.js, replace:
const TMDB_API_KEY = 'your_api_key_here';
```

**For Production:**
- Use environment variables (recommended)
- Add to `.env` file (create one in root)
```
TMDB_API_KEY=your_api_key_here
```

### Step 4: Set Up Expo Account (for APK builds)

```bash
# Create Expo account at https://expo.dev
# Then login locally
eas login

# Verify setup
eas whoami
```

### Step 5: Verify Installation

```bash
# Test web version
npm run web

# You should see:
# > Metro waiting on exp://[IP]:5000
# > Web is waiting on http://localhost:5000
```

---

## Configuration

### `app.json` - Expo Configuration

```json
{
  "expo": {
    "name": "beenama",
    "slug": "beenama",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "scheme": "beenama",  // Custom URL scheme for deep linking
    "linking": {
      "schemes": ["beenama"],
      "config": {
        "screens": {
          "(tabs)/profile": "profile"
        }
      }
    },
    "web": {
      "bundler": "metro",
      "output": "single"
    },
    "android": {
      "package": "com.akar1881.beenama"
    }
  }
}
```

### `eas.json` - Build Configuration

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"  // Builds standalone APK
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Environment Variables

Create `.env` file in root:
```
TMDB_API_KEY=your_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

### Deep Linking Setup

The app uses deep linking to handle OAuth redirects from TMDB:
- **Web**: Redirects to `http://localhost:5000/profile`
- **Mobile**: Redirects to `beenama://profile` (handled by `app.json` config)

---

## Usage Guide

### For End Users

#### Signing In

1. Navigate to **Profile** tab (bottom right)
2. Tap **"Sign in with TMDB"** button
3. Browser opens TMDB login page
4. Enter your TMDB credentials
5. Grant app permission
6. Automatically redirected back to Beenama

#### Managing Your Watchlist

1. Find a movie/show you want to watch
2. Tap the card to view details
3. Tap **"+ Add"** button
4. Check **"Watchlist"** box
5. Tap confirm to save

#### Creating Custom Lists

1. Go to **Profile** tab
2. Scroll to "Custom Collections"
3. View existing lists or create new ones
4. To create:
   - Add movie/show to a list
   - Select "Create new list"
   - Name your collection
   - Add as many items as you want

#### Searching for Content

1. Tap search icon in header
2. Type movie/show name
3. Tap result to view details
4. Swipe down or tap back to close search

#### Filtering Content

1. On Movies/TV/Anime tab
2. Tap filter icon (top right)
3. Select genre, year, etc.
4. Tap "Apply" to see filtered results

### For Developers

#### Running in Development

```bash
# Web preview (best for UI development)
npm run web

# Android with Expo Go
npm run android

# iOS with Expo Go (Mac only)
npm run ios
```

#### Hot Reload & Debugging

```bash
# While app is running, press:
r     # Reload app
d     # Open debugger
m     # Toggle menu

# Check browser console for logs
# Use React Native Debugger for advanced debugging
```

#### Viewing Logs

```bash
# Metro bundler logs appear in terminal
# Browser console logs appear in browser DevTools
# App console logs: npx expo start --web --clear
```

---

## Architecture

### App Flow

```
App Entry Point (app/_layout.js)
    ↓
Auth Check (getAuthState)
    ↓
Tab Navigation Setup
    ├─ Home (Trending)
    ├─ Movies (Discovery + Filter)
    ├─ TV Shows (Discovery + Filter)
    ├─ Anime (Animation genre)
    └─ Profile (Auth + Collections)
    ↓
Details Page (Dynamic route)
    ├─ TMDB data fetch
    ├─ Add to list
    └─ Related content
```

### Data Flow

```
TMDB API (REST)
    ↓
tmdbApi.js (Axios client)
    ↓
Screen Components
    ├─ Fetch data (useEffect)
    ├─ Update state (useState)
    └─ Render UI
    ↓
AsyncStorage (Local persistence)
    ├─ Auth tokens
    ├─ Custom lists
    └─ User preferences
```

### State Management

We use React's built-in `useState` for state management:

```javascript
// Screen level state
const [movies, setMovies] = useState([]);
const [loading, setLoading] = useState(true);
const [filters, setFilters] = useState({ genre: null });

// Auth state (persisted in AsyncStorage)
const [authState, setAuthState] = useState({
  sessionId: null,
  account: null
});

// List state (persisted locally)
const [customLists, setCustomLists] = useState([]);
```

### Component Hierarchy

```
App
├── Header (Search + Profile)
│   └── SearchResults Modal
├── Tab Navigation
│   ├── HomeScreen
│   │   └── PosterCard (x multiple)
│   ├── MoviesScreen
│   │   ├── FilterModal
│   │   └── PosterCard (x multiple)
│   ├── TVScreen
│   │   ├── FilterModal
│   │   └── PosterCard (x multiple)
│   ├── AnimeScreen
│   │   └── PosterCard (x multiple)
│   └── ProfileScreen
│       ├── AccountInfo
│       ├── ListsModal
│       └── CustomLists
└── DetailsScreen (Dynamic)
    ├── ListsModal
    └── VideoPlayer
```

---

## API Reference

### TMDB API Integration

All API calls go through `services/tmdbApi.js`:

#### Authentication Service (`authService.js`)

**Create Request Token**
```javascript
const token = await createRequestToken();
// Returns: request token for OAuth flow
```

**Create Session**
```javascript
const sessionId = await createSessionId(requestToken);
// Returns: session ID after user approves
```

**Get Account Details**
```javascript
const account = await getAccountDetails(sessionId);
// Returns: { id, username, name, ... }
```

**Watchlist Operations**
```javascript
// Add to watchlist
await addToWatchlist(accountId, sessionId, mediaId, 'movie', true);

// Get watchlist
const items = await getWatchlist(accountId, sessionId);
```

**Favorites Operations**
```javascript
// Add to favorites
await addToFavorites(accountId, sessionId, mediaId, 'tv', true);

// Get favorites
const items = await getFavorites(accountId, sessionId);
```

#### List Service (`listService.js`)

**Custom Lists (Local)**
```javascript
// Get all lists
const lists = await getCustomLists();

// Create list
const listId = await createCustomList('My List', 'Description');

// Add item to list
await addItemToList(listId, itemId, mediaType);

// Check if item in list
const inList = await isItemInList(listId, itemId);

// Delete list
await deleteCustomList(listId);
```

#### TMDB API Client (`tmdbApi.js`)

**Trending Content**
```javascript
// Get trending movies/shows
const trending = await fetchTrending('week');
// Returns: [ { id, title, poster_path, ... }, ... ]
```

**Movie Discovery**
```javascript
const movies = await fetchMovies({
  page: 1,
  sortBy: 'popularity.desc',
  with_genres: 28,  // Action
  year: 2024
});
```

**TV Shows Discovery**
```javascript
const shows = await fetchTVShows({
  page: 1,
  sortBy: 'popularity.desc',
  with_genres: 16  // Animation
});
```

**Search**
```javascript
const results = await searchContent('Inception');
// Returns: [ movies, shows, people ]
```

**Details & Related**
```javascript
const details = await fetchDetails('movie', id);
const related = await fetchRelatedContent('movie', id);
```

---

## Building & Deployment

### Local Testing

#### Android with Expo Go
```bash
# Download Expo Go app on Android device
npm run android

# Scan QR code with Expo Go
# App loads on your device
```

#### Web
```bash
npm run web
# Opens at http://localhost:5000
```

### Building APK (Production)

#### Prerequisite Setup
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Verify login
eas whoami
```

#### Building APK

```bash
# Build APK file
eas build --platform android

# When prompted:
# ? What do you want to build? [Select] preview

# The build will:
# 1. Upload your code to Expo servers
# 2. Compile on their infrastructure
# 3. Generate APK file
# 4. Provide download link when complete
```

**Build takes 5-10 minutes** depending on queue.

#### Downloading APK

Once build completes:
1. You'll get a direct download link
2. Click to download `.apk` file
3. Transfer to Android device
4. Open file manager and tap the APK
5. Tap "Install"
6. Grant permissions
7. Launch app

### Building AAB (Google Play)

```bash
# For Google Play Store submission
eas build --platform android --type aab

# This builds Android App Bundle instead of APK
# Required for Play Store uploads
```

### Production Deployment Checklist

- [ ] Update version in `app.json` and `package.json`
- [ ] Test on real device thoroughly
- [ ] Update TMDB API key (if using demo key, use production key)
- [ ] Test all authentication flows
- [ ] Test all list operations
- [ ] Performance test on low-end device
- [ ] Verify dark theme works properly
- [ ] Test video playback
- [ ] Build signed APK/AAB
- [ ] Test installation from file
- [ ] Document changes in `CHANGELOG.md`

---

## Styling Guidelines

### Color System

The app uses a strict **black & white cinematic** palette:

| Usage | Color | Hex |
|-------|-------|-----|
| Primary Background | Pure Black | `#000` |
| Secondary Background | Very Dark Gray | `#0a0a0a` |
| Cards/Inputs | Dark Gray | `#1a1a1a` |
| Primary Text | White | `#fff` |
| Secondary Text | Light Gray | `#d4d4d4` |
| Tertiary Text | Medium Gray | `#999` |
| Borders | Dark | `#333` |
| Overlays | Black with Opacity | `rgba(0,0,0,0.5-0.92)` |

### Typography

```javascript
// Page Titles
{
  fontSize: 22,
  fontWeight: '800',
  letterSpacing: 0.3,
  color: '#fff'
}

// Section Headers
{
  fontSize: 18,
  fontWeight: '800',
  letterSpacing: 0.3
}

// Body Text
{
  fontSize: 14,
  fontWeight: '400',
  lineHeight: 24
}

// Metadata/Labels
{
  fontSize: 12,
  fontWeight: '500',
  lineHeight: 16
}
```

### Spacing System

Use these consistent increments:
- `8px` - Tight spacing
- `12px` - Small gaps
- `16px` - Standard padding
- `18px` - Page padding
- `20px` - Section spacing
- `24px` - Large gaps

### Components

#### Card
```javascript
{
  borderRadius: 12,
  backgroundColor: '#1a1a1a',
  borderWidth: 1,
  borderColor: '#333',
  paddingHorizontal: 16,
  paddingVertical: 14,
  marginBottom: 12
}
```

#### Button
```javascript
{
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 10,
  backgroundColor: '#fff'
}
```

#### Modal
```javascript
{
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  backgroundColor: '#0a0a0a',
  borderTopWidth: 1,
  borderTopColor: '#333'
}
```

### Animations

Always use `useNativeDriver: true` for performance:

```javascript
// Press animation (180ms)
Animated.timing(scaleAnim, {
  toValue: 0.92,
  duration: 180,
  useNativeDriver: true
}).start();

// Opacity transition (300ms)
Animated.timing(opacityAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true
}).start();
```

---

## Development

### Code Organization

#### Component Template
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyComponent() {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Load data
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Title</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff'
  }
});
```

### Best Practices

1. **Use `useEffect` for side effects**
   ```javascript
   useEffect(() => {
     loadData();
   }, [dependencies]);
   ```

2. **Handle loading states**
   ```javascript
   if (loading) return <ActivityIndicator />;
   if (!data) return <EmptyState />;
   ```

3. **Persist sensitive data**
   ```javascript
   // Save to AsyncStorage
   await AsyncStorage.setItem('key', JSON.stringify(value));
   
   // Retrieve
   const value = await AsyncStorage.getItem('key');
   ```

4. **Catch errors gracefully**
   ```javascript
   try {
     // API call
   } catch (error) {
     console.error('Error:', error);
     Alert.alert('Error', 'Something went wrong');
   }
   ```

5. **Use correct prop types**
   - Pass required props
   - Validate data before rendering
   - Use defaults for optional props

### Common Tasks

#### Adding a New Screen
1. Create file in `app/(tabs)/newscreen.js`
2. Export default component
3. Automatically becomes a tab

#### Adding a New API Endpoint
1. Add function to `services/tmdbApi.js`
2. Use `authClient.get()` or `authClient.post()`
3. Export function
4. Import in component

#### Styling a Component
1. Add `styles` object at bottom of file
2. Use `StyleSheet.create()`
3. Reference with `style={styles.styleName}`

---

## Troubleshooting

### App Won't Start

**Symptom**: `Metro bundler stuck` or `Module not found`

**Solution**:
```bash
# Clear cache and reinstall
npm ci
npm start -- --clear

# Or manually clear
rm -rf node_modules package-lock.json
npm install
```

### TMDB Sign-In Not Working

**Symptom**: Click sign-in button, nothing happens

**Causes & Solutions**:
- **Browser not opening**: Check if deep linking configured in `app.json`
- **Wrong redirect URL**: Ensure `beenama://profile` is in app.json
- **API key invalid**: Verify TMDB API key in `tmdbApi.js`

**Fix**:
```javascript
// In app.json, ensure:
"linking": {
  "schemes": ["beenama"],
  "config": {
    "screens": {
      "(tabs)/profile": "profile"
    }
  }
}
```

### Video Player Not Playing

**Symptom**: Player shows but won't play video

**Causes**:
- Invalid URL format
- Unsupported video codec
- Network issue

**Solution**:
```javascript
// Verify URL format
const validUrl = 'https://.../.mkv';  // ✓ Correct
const invalidUrl = 'mkv://...';       // ✗ Wrong

// Check supported formats
// Supported: HLS (.m3u8), MP4, MKV, MOV
```

### Lists Not Saving

**Symptom**: Custom lists deleted after app restart

**Cause**: AsyncStorage not initialized

**Solution**:
```javascript
// Always handle AsyncStorage promises
const lists = await AsyncStorage.getItem('customLists');
if (lists) {
  setLists(JSON.parse(lists));
}
```

### Performance Issues

**Symptom**: App laggy, slow scrolling

**Solution**:
1. Reduce image size with TMDB image width parameter
2. Enable `useNativeDriver: true` in animations
3. Use `useMemo` for expensive computations
4. Limit simultaneous API requests

### API Rate Limiting

**Symptom**: "429 Too Many Requests" errors

**Causes**: 
- Demo API key has limits
- Making too many requests

**Solution**:
```javascript
// Use production API key
// Add request throttling:
const throttle = (func, delay) => {
  let lastRun = 0;
  return function(...args) {
    if (Date.now() - lastRun < delay) return;
    func(...args);
    lastRun = Date.now();
  };
};
```

### iOS Building Issues

**Symptom**: iOS build fails on M1 Mac

**Solution**:
```bash
# Use native Apple Silicon Expo build
eas build --platform ios --type simulator

# Or build for physical device
eas build --platform ios --type app
```

---

## FAQ

### Q: Can I use this app commercially?
**A**: This is a demo/learning project. To use commercially, you need:
- TMDB API commercial license
- Own branding
- Proper licensing

### Q: How do I change the app name?
**A**: Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Q: Can I sell the APK?
**A**: No, TMDB has usage restrictions. For commercial use, contact TMDB for licensing.

### Q: How do I add more video formats?
**A**: The player uses Expo AV which supports:
- HLS (`.m3u8`)
- MP4, MOV, MKV (via file path)
- Streaming URLs

Add support by changing the video source URL in `app/watch/index.js`.

### Q: Can I use this on iOS/web?
**A**: Yes! The code works on all platforms:
- **Android**: Full support
- **iOS**: Full support (requires Mac)
- **Web**: Full support (no native modules)

### Q: How do I get an API key?
**A**: 
1. Go to https://www.themoviedb.org/settings/api
2. Sign up (free)
3. Create API key
4. Use in `services/tmdbApi.js`

### Q: Where is data stored?
**A**: 
- **Auth tokens**: AsyncStorage (device)
- **Custom lists**: AsyncStorage (device)
- **API data**: Cached in memory (session)
- **No backend server**: Everything local or TMDB

### Q: How do I debug the app?
**A**:
```bash
# Console logs
console.log('Debug:', variable);

# React Native Debugger
npm run web -- --dev

# Expo Dev Tools
Press 'd' while app running
```

### Q: What's the file size?
**A**: 
- APK: ~50-80MB (depends on build)
- Bundle: ~30MB

---

## Contributing

### Setup Development Environment

```bash
# Clone repo
git clone <url>
cd beenama-app

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature-name

# Start development
npm run web
```

### Code Style

- **Naming**: camelCase for functions, PascalCase for components
- **Formatting**: 2 spaces indentation
- **Comments**: Explain *why*, not *what*
- **Strings**: Use template literals for dynamic strings

### Styling Standards

See `CONTRIBUTION.md` for detailed styling guidelines:
- **Colors**: Only black & white palette
- **Typography**: Specific font sizes and weights
- **Spacing**: Use 8px, 12px, 16px increments
- **Animations**: Use `useNativeDriver: true`

### Commit Messages

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Reorganize code
test: Add tests
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear messages
5. Create pull request
6. Describe changes
7. Wait for review

### Reporting Issues

Include:
- Device/platform (Android/iOS/Web)
- App version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if possible

---

## Roadmap

### Version 1.1 (Next)
- [ ] Backend server for cross-device list sync
- [ ] Dark mode toggle
- [ ] Show recommendations based on watched content
- [ ] Director/actor filtering
- [ ] User ratings & reviews

### Version 2.0
- [ ] Social features (friends, share lists)
- [ ] Watch party synchronization
- [ ] Advanced search with complex filters
- [ ] Offline downloads
- [ ] Notification alerts for new releases

### Future Ideas
- [ ] Recommendation engine
- [ ] Community reviews
- [ ] Integration with streaming platforms
- [ ] Advanced analytics
- [ ] Multi-user household support

---

## Resources

### Official Documentation
- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [TMDB API Docs](https://developer.themoviedb.org)
- [Expo Router Docs](https://docs.expo.dev/routing/introduction/)

### Learning Resources
- [React Native School](https://react-native.school)
- [Expo Snack Playground](https://snack.expo.dev)
- [TMDB API Reference](https://developer.themoviedb.org/3)

### Tools & Services
- [Expo Dev Client](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Postman](https://www.postman.com) - Test API endpoints

---

## License

This project is private and for demonstration purposes. 

TMDB data is provided under the [TMDB Terms of Service](https://www.themoviedb.org/settings/terms).

---

## Support

For issues, questions, or suggestions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing issues
3. Create detailed issue report

---

## Credits

Built with ❤️ using React Native, Expo, and TMDB API.

**Last Updated**: December 29, 2025  
**Current Version**: 1.0.0
