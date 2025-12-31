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
import { Video, ResizeMode } from 'expo-av';
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

export default function VideoPlayer({ source, subtitleUrl, title, onBack }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [quality, setQuality] = useState('auto');
  const [subtitle, setSubtitle] = useState(null);
  const [parsedSubtitles, setParsedSubtitles] = useState([]);
  const [currentSubtitleText, setCurrentSubtitleText] = useState('');
  const [captionSettings, setCaptionSettings] = useState({
    color: '#FFFFFF',
    size: 'M',
    backgroundCapacity: '50%',
    position: 10,
    delay: 0,
  });

  const videoSource = typeof source === 'string' ? { uri: source } : source;

  useEffect(() => {
    if (subtitleUrl && subtitle) {
      fetchSubtitles(subtitleUrl);
    } else {
      setParsedSubtitles([]);
      setCurrentSubtitleText('');
    }
  }, [subtitleUrl, subtitle]);

  useEffect(() => {
    if (parsedSubtitles.length > 0 && typeof status.positionMillis === 'number') {
      const currentTime = (status.positionMillis / 1000) - captionSettings.delay;
      const activeCue = parsedSubtitles.find(
        cue => currentTime >= cue.start && currentTime <= cue.end
      );
      setCurrentSubtitleText(activeCue ? activeCue.text : '');
    }
  }, [status.positionMillis, parsedSubtitles, captionSettings.delay]);

  const fetchSubtitles = async (url) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      parseVTT(text);
    } catch (e) {
      console.warn('Failed to fetch subtitles:', e);
    }
  };

  const parseVTT = (data) => {
    const cues = [];
    const lines = data.replace(/\r/g, '').split('\n');
    let currentCue = null;

    const timeRegex = /(\d{2}:\d{2}:\d{2}.\d{3}) --> (\d{2}:\d{2}:\d{2}.\d{3})/;

    lines.forEach(line => {
      const match = timeRegex.exec(line);
      if (match) {
        if (currentCue) cues.push(currentCue);
        currentCue = {
          start: parseVttTime(match[1]),
          end: parseVttTime(match[2]),
          text: ''
        };
      } else if (currentCue && line.trim() !== '' && !line.includes('WEBVTT')) {
        currentCue.text += (currentCue.text ? '\n' : '') + line.trim();
      }
    });
    if (currentCue) cues.push(currentCue);
    setParsedSubtitles(cues);
  };

  const parseVttTime = (timeStr) => {
    const parts = timeStr.split(':');
    const secondsParts = parts[2].split('.');
    return (
      parseInt(parts[0]) * 3600 +
      parseInt(parts[1]) * 60 +
      parseInt(secondsParts[0]) +
      parseInt(secondsParts[1]) / 1000
    );
  };

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
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
      }
    } catch (e) {
      console.warn('Orientation lock failed:', e);
      // Still toggle state so UI updates
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTime = (ms) => {
    if (!ms || typeof ms !== 'number') return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const skipForward = async () => {
    if (videoRef.current && typeof status.positionMillis === 'number') {
      try {
        const newPosition = status.positionMillis + 10000;
        await videoRef.current.setPositionAsync(newPosition);
        if (Platform.OS === 'web') {
          setStatus(prev => ({ ...prev, positionMillis: newPosition }));
        }
      } catch (e) {
        console.warn('Seek failed:', e);
      }
    }
  };

  const skipBackward = async () => {
    if (videoRef.current && typeof status.positionMillis === 'number') {
      try {
        const newPosition = Math.max(0, status.positionMillis - 10000);
        await videoRef.current.setPositionAsync(newPosition);
        if (Platform.OS === 'web') {
          setStatus(prev => ({ ...prev, positionMillis: newPosition }));
        }
      } catch (e) {
        console.warn('Seek failed:', e);
      }
    }
  };

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
              if (videoRef.current) videoRef.current.setRateAsync(s, true);
              setActiveMenu('settings');
            }}
            onBack={() => setActiveMenu('settings')}
          />
        );
      case 'captions':
        return (
          <CaptionsMenu
            settings={captionSettings}
            onUpdate={(update) => setCaptionSettings(prev => ({ ...prev, ...update }))}
            onBack={() => setActiveMenu('settings')}
          />
        );
      case 'subtitles':
        return (
          <SubtitlesMenu
            currentSubtitle={subtitle}
            availableSubtitles={[{ id: 1, label: 'English' }, { id: 2, label: 'Arabic' }]}
            onSelect={(s) => {
              setSubtitle(s);
              setActiveMenu(null);
            }}
            onBack={() => setActiveMenu(null)}
          />
        );
      case 'quality':
        return (
          <QualityMenu
            currentQuality={quality}
            availableQualities={['1080p', '720p', '480p']}
            onSelect={(q) => {
              setQuality(q);
              setActiveMenu(null);
            }}
            onBack={() => setActiveMenu(null)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <StatusBar hidden={isFullscreen} />
      
      <View style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          style={styles.videoElement}
          source={videoSource}
          resizeMode={ResizeMode.STRETCH}
          videoStyle={Platform.OS === 'web' ? {
            width: '100%',
            height: '100%',
            objectFit: 'fill',
          } : {}}
          shouldPlay
          onPlaybackStatusUpdate={setStatus}
          progressUpdateIntervalMillis={500}
        />

        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleControls}
          style={StyleSheet.absoluteFill}
        >
          {showControls && (
            <Animated.View style={[styles.controlsOverlay, { opacity: controlsOpacity }]}>
              {/* Top Bar / Back Button */}
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
                  onPress={() => status.isPlaying ? videoRef.current.pauseAsync() : videoRef.current.playAsync()}
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
                    value={status.positionMillis || 0}
                    onSlidingComplete={async (value) => {
                      try {
                        await videoRef.current.setPositionAsync(value);
                        if (Platform.OS === 'web') {
                          setStatus(prev => ({ ...prev, positionMillis: value }));
                        }
                      } catch (e) {
                        console.warn('Seek failed:', e);
                      }
                    }}
                    minimumTrackTintColor="#fff"
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor="#fff"
                  />
                </View>

                <View style={styles.bottomRow}>
                  <View style={styles.bottomLeft}>
                    <TouchableOpacity
                      onPress={() => status.isPlaying ? videoRef.current.pauseAsync() : videoRef.current.playAsync()}
                    >
                      {status.isPlaying ? <Pause color="#fff" size={22} fill="#fff" /> : <Play color="#fff" size={22} fill="#fff" />}
                    </TouchableOpacity>

                    <View style={styles.volumeContainer}>
                      <TouchableOpacity 
                        onPress={() => {
                          const newMuted = !isMuted;
                          setIsMuted(newMuted);
                          if (videoRef.current) videoRef.current.setIsMutedAsync(newMuted);
                        }}
                      >
                        {isMuted || volume === 0 ? <VolumeX color="#fff" size={20} /> : <Volume2 color="#fff" size={20} />}
                      </TouchableOpacity>
                      <Slider
                        style={styles.volumeSlider}
                        minimumValue={0}
                        maximumValue={1}
                        value={isMuted ? 0 : volume}
                        onValueChange={(v) => {
                          setVolume(v);
                          const newMuted = v === 0;
                          setIsMuted(newMuted);
                          if (videoRef.current) {
                            videoRef.current.setVolumeAsync(v);
                            videoRef.current.setIsMutedAsync(newMuted);
                          }
                        }}
                        minimumTrackTintColor="#fff"
                        maximumTrackTintColor="rgba(255,255,255,0.3)"
                        thumbTintColor="#fff"
                      />
                    </View>

                    <Text style={styles.timeText}>
                      {formatTime(status.positionMillis)} / {formatTime(status.durationMillis)}
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

      {currentSubtitleText !== '' && (
        <View
          style={[
            styles.subtitleContainer,
            { bottom: `${captionSettings.position}%` }
          ]}
        >
          <Text
            style={[
              styles.subtitleText,
              {
                color: captionSettings.color,
                fontSize: captionSettings.size === 'XS' ? 12 : captionSettings.size === 'S' ? 14 : captionSettings.size === 'M' ? 18 : captionSettings.size === 'L' ? 22 : 26,
                backgroundColor: `rgba(0,0,0,${parseFloat(captionSettings.backgroundCapacity) / 100})`,
              }
            ]}
          >
            {currentSubtitleText}
          </Text>
        </View>
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
    ...StyleSheet.absoluteFillObject,
    width: screenHeight,
    height: screenWidth,
    zIndex: 9999,
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
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  subtitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  subtitleText: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
});
