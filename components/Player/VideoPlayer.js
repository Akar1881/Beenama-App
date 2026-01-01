import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import Slider from '@react-native-community/slider';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Settings,
  Volume2,
  VolumeX,
  Type,
  Layers,
} from 'lucide-react-native';

import SettingsMenu from './menus/settingsMenu';
import PlaybackSpeedMenu from './menus/playbackSpeedMenu';
import CaptionsMenu from './menus/captionsMenu';
import SubtitlesMenu from './menus/subtitlesMenu';
import QualityMenu from './menus/qualityMenu';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VideoPlayer({ source, subtitleUrl, title, onBack, availableQualities = [], availableSubtitles = [], onQualityChange, onSubtitleChange, initialPositionMillis = 0, onPositionChange, onFullscreenChange }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({
    isPlaying: true,
    positionMillis: 0,
    durationMillis: 0,
  });
  const [seekingPosition, setSeekingPosition] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [quality, setQuality] = useState('Auto');
  const [subtitle, setSubtitle] = useState(null);

  const videoSource = typeof source === 'string' ? { uri: source } : source;

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (showControls && !activeMenu) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => hideControls(), 3000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showControls, activeMenu]);

  const toggleControls = () => {
    if (showControls) {
      hideControls();
    } else {
      showControlsAnim();
    }
  };

  const showControlsAnim = () => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const hideControls = () => {
    if (activeMenu) return;
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished) setShowControls(false);
    });
  };

  const handleFullscreen = async () => {
    if (Platform.OS === 'web') {
      try {
        const elem = document.fullscreenElement;
        if (!elem) {
          const container = document.getElementById('video-player-root');
          if (container && container.requestFullscreen) {
            await container.requestFullscreen();
            if (screen.orientation && screen.orientation.lock) {
              await screen.orientation.lock('landscape-primary').catch(() => {});
            }
            setIsFullscreen(true);
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
            if (screen.orientation && screen.orientation.unlock) {
              screen.orientation.unlock();
            }
            setIsFullscreen(false);
          }
        }
      } catch (e) {
        console.warn('Fullscreen API failed:', e);
        setIsFullscreen(!isFullscreen);
      }
    } else {
      try {
        if (!isFullscreen) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
        setIsFullscreen(!isFullscreen);
      } catch (e) {
        console.warn('Orientation lock failed:', e);
        setIsFullscreen(!isFullscreen);
      }
    }
  };

  useEffect(() => {
    if (typeof onFullscreenChange === 'function') onFullscreenChange(isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }
  }, []);

  const formatTime = (ms) => {
    if (!ms || typeof ms !== 'number') return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const skipForward = () => {
    if (videoRef.current) {
      const newPosition = status.positionMillis + 10000;
      setSeekingPosition(newPosition);
      videoRef.current.seek(newPosition / 1000);
      setTimeout(() => setSeekingPosition(null), 500);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      const newPosition = Math.max(0, status.positionMillis - 10000);
      setSeekingPosition(newPosition);
      videoRef.current.seek(newPosition / 1000);
      setTimeout(() => setSeekingPosition(null), 500);
    }
  };

  const onProgress = (data) => {
    const pos = data.currentTime * 1000;
    setStatus(prev => ({
      ...prev,
      positionMillis: pos,
      durationMillis: data.seekableDuration * 1000 || prev.durationMillis
    }));
    if (typeof onPositionChange === 'function') onPositionChange(pos);
  };

  const onLoad = (data) => {
    setStatus(prev => ({
      ...prev,
      durationMillis: data.duration * 1000
    }));
    // seek to initial position if provided
    try {
      if (initialPositionMillis && videoRef.current && typeof videoRef.current.seek === 'function') {
        videoRef.current.seek(initialPositionMillis / 1000);
        setStatus(prev => ({ ...prev, positionMillis: initialPositionMillis }));
      }
    } catch (e) {
      console.warn('Seek to initial position failed', e);
    }
  };

  useEffect(() => {
    // if initialPositionMillis updates, seek to it (e.g., when resuming)
    if (initialPositionMillis && videoRef.current && typeof videoRef.current.seek === 'function') {
      try { videoRef.current.seek(initialPositionMillis / 1000); } catch (e) { }
    }
  }, [initialPositionMillis, source]);

  const renderActiveMenu = () => {
    switch (activeMenu) {
      case 'settings':
        return (
          <SettingsMenu
            onNavigate={(menu) => setActiveMenu(menu)}
            onBack={() => setActiveMenu(null)}
          />
        );
      case 'playbackSpeed':
        return (
          <PlaybackSpeedMenu
            currentSpeed={playbackSpeed}
            onSelect={(s) => {
              setPlaybackSpeed(s);
              setActiveMenu('settings');
            }}
            onBack={() => setActiveMenu('settings')}
          />
        );
      case 'captions':
        return (
          <CaptionsMenu
            settings={{}}
            onUpdate={() => {}}
            onBack={() => setActiveMenu('settings')}
          />
        );
      case 'subtitles':
        return (
          <SubtitlesMenu
            currentSubtitle={subtitle}
            availableSubtitles={availableSubtitles.length > 0 ? availableSubtitles : [{ id: 'off', label: 'Off' }]}
            onSelect={(s) => {
              setSubtitle(s);
              if (onSubtitleChange) onSubtitleChange(s);
              setActiveMenu(null);
            }}
            onBack={() => setActiveMenu(null)}
          />
        );
      case 'quality':
        return (
          <QualityMenu
            currentQuality={quality}
            availableQualities={availableQualities.length > 0 ? availableQualities : ['Auto']}
            onSelect={(q) => {
              setQuality(q);
              if (onQualityChange) onQualityChange(q);
              setActiveMenu(null);
            }}
            onBack={() => setActiveMenu(null)}
          />
        );
      default:
        return null;
    }
  };

  const selectedTextTrack = subtitleUrl && subtitle ? {
    type: 'title',
    value: subtitle.label
  } : undefined;

  const textTracks = availableSubtitles
    .filter(s => s.id !== 'off')
    .map(s => ({
      title: s.label,
      language: s.language || 'en',
      type: 'text/vtt',
      uri: s.url
    }));

  return (
    <View 
      id={Platform.OS === 'web' ? 'video-player-root' : undefined}
      style={[styles.container, isFullscreen && styles.fullscreenContainer]}
    >
      <StatusBar hidden={isFullscreen} />
      
      <View style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          source={videoSource}
          style={isFullscreen && Platform.OS !== 'web' ? styles.videoElementFullscreenNative : (isFullscreen ? styles.videoElementFullscreen : styles.videoElement)}
          resizeMode="contain"
          paused={!status.isPlaying}
          volume={isMuted ? 0 : volume}
          rate={playbackSpeed}
          onProgress={onProgress}
          onLoad={onLoad}
          selectedTextTrack={selectedTextTrack}
          textTracks={textTracks}
          playInBackground={false}
          playWhenInactive={false}
          controls={false}
        />

        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleControls}
          style={StyleSheet.absoluteFill}
        >
          {showControls && (
            <Animated.View style={[styles.controlsOverlay, { opacity: controlsOpacity }]}>
              <View style={styles.topBar}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                  <RotateCcw color="#fff" size={24} style={{ transform: [{ rotate: '90deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.topTitle} numberOfLines={1}>{title}</Text>
              </View>

              <View style={styles.centerControls}>
                <TouchableOpacity onPress={skipBackward} style={styles.iconBtn}>
                  <RotateCcw color="#fff" size={32} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStatus(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                  style={[styles.iconBtn, styles.playBtn]}
                >
                  {status.isPlaying ? <Pause color="#fff" size={36} fill="#fff" /> : <Play color="#fff" size={36} fill="#fff" />}
                </TouchableOpacity>
                <TouchableOpacity onPress={skipForward} style={styles.iconBtn}>
                  <RotateCw color="#fff" size={32} />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomContainer}>
                <View style={styles.progressBarContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={status.durationMillis || 1}
                    value={seekingPosition !== null ? seekingPosition : (status.positionMillis || 0)}
                    onValueChange={(value) => setSeekingPosition(value)}
                    onSlidingComplete={(value) => {
                      videoRef.current.seek(value / 1000);
                      setTimeout(() => setSeekingPosition(null), 500);
                    }}
                    minimumTrackTintColor="#fff"
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor="#fff"
                  />
                </View>

                <View style={styles.bottomRow}>
                  <View style={styles.bottomLeft}>
                    <TouchableOpacity onPress={() => setStatus(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}>
                      {status.isPlaying ? <Pause color="#fff" size={22} fill="#fff" /> : <Play color="#fff" size={22} fill="#fff" />}
                    </TouchableOpacity>

                    <View style={styles.volumeContainer}>
                      <TouchableOpacity onPress={() => setIsMuted(!isMuted)}>
                        {isMuted || volume === 0 ? <VolumeX color="#fff" size={20} /> : <Volume2 color="#fff" size={20} />}
                      </TouchableOpacity>
                      <Slider
                        style={styles.volumeSlider}
                        minimumValue={0}
                        maximumValue={1}
                        value={isMuted ? 0 : volume}
                        onValueChange={(v) => {
                          setVolume(v);
                          setIsMuted(v === 0);
                        }}
                        minimumTrackTintColor="#fff"
                        maximumTrackTintColor="rgba(255,255,255,0.3)"
                        thumbTintColor="#fff"
                      />
                    </View>

                    <Text style={styles.timeText}>
                      {formatTime(seekingPosition !== null ? seekingPosition : status.positionMillis)} / {formatTime(status.durationMillis)}
                    </Text>
                  </View>

                  <View style={styles.bottomRight}>
                    <TouchableOpacity style={styles.rightIcon} onPress={() => setActiveMenu('quality')}>
                      <Layers color="#fff" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rightIcon} onPress={() => setActiveMenu('subtitles')}>
                      <Type color="#fff" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rightIcon} onPress={() => setActiveMenu('settings')}>
                      <Settings color="#fff" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleFullscreen}>
                      {isFullscreen ? <Minimize color="#fff" size={20} /> : <Maximize color="#fff" size={20} />}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>

      {activeMenu && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setActiveMenu(null)}
          style={styles.menuOverlay}
        >
          <View onStartShouldSetResponder={() => true} style={styles.menuContainer}>
            {renderActiveMenu()}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  fullscreenContainer: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 99999,
    width: Platform.OS === 'web' ? '100vw' : Dimensions.get('screen').height,
    height: Platform.OS === 'web' ? '100vh' : Dimensions.get('screen').width,
  },
  videoWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoElement: {
    width: '100%',
    height: '100%',
  },
  videoElementFullscreen: {
    width: '100%',
    height: '100%',
  },
  videoElementFullscreenNative: {
    width: Dimensions.get('screen').height,
    height: Dimensions.get('screen').width,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: screenWidth > 600 ? 60 : 30,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 40 : 16,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  topTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  iconBtn: {
    padding: 10,
  },
  playBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    padding: 15,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressBarContainer: {
    height: 20,
    justifyContent: 'center',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: screenWidth > 400 ? 100 : 70,
    gap: 4,
  },
  volumeSlider: {
    flex: 1,
    height: 30,
  },
  timeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rightIcon: {
    padding: 2,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
});