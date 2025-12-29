import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, BackHandler, useWindowDimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Settings, Subtitles, MonitorPlay, X, ChevronRight, Minimize, Check } from 'lucide-react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import Slider from '@react-native-community/slider';

export default function VideoPlayer({ source, title, onBack, subtitleUrl }) {
  const videoRef = useRef(null);
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const [status, setStatus] = useState({});
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [quality, setQuality] = useState('1080p');
  const [activeSource, setActiveSource] = useState('Demo');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState('Off');
  const [isSeeking, setIsSeeking] = useState(false);
  const [settingsView, setSettingsView] = useState('main');

  const hideControlsTimer = useRef(null);

  useEffect(() => {
    resetControlsTimer();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      backHandler.remove();
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [isFullscreen, isSeeking, status.isPlaying]);

  const handleBack = () => {
    if (isFullscreen) {
      toggleFullscreen();
      return true;
    }
    return false;
  };

  const resetControlsTimer = () => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    setShowControls(true);
    if (!isSeeking && status.isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const togglePlay = async () => {
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    resetControlsTimer();
  };

  const skipForward = async () => {
    await videoRef.current.setPositionAsync(status.positionMillis + 10000);
    resetControlsTimer();
  };

  const skipBackward = async () => {
    await videoRef.current.setPositionAsync(Math.max(0, status.positionMillis - 10000));
    resetControlsTimer();
  };

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
      setIsFullscreen(!isFullscreen);
    }
    resetControlsTimer();
  };

  const handleSeek = async (value) => {
    await videoRef.current.setPositionAsync(value);
    setIsSeeking(false);
    resetControlsTimer();
  };

  const formatTime = (millis) => {
    if (!millis) return '00:00';
    const totalSeconds = millis / 1000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = async (val) => {
    setVolume(val);
    setIsMuted(val === 0);
    await videoRef.current.setVolumeAsync(val);
  };

  const handleMuteToggle = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    await videoRef.current.setVolumeAsync(newMuted ? 0 : volume);
  };

  const renderSettingsContent = () => {
    switch (settingsView) {
      case 'speed':
        return (
          <View>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSettingsView('main')}><ChevronRight size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }}/></TouchableOpacity>
              <Text style={styles.modalTitle}>Playback Speed</Text>
              <View style={{ width: 24 }} />
            </View>
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
              <TouchableOpacity key={speed} style={styles.settingItem} onPress={async () => {
                setPlaybackSpeed(speed);
                await videoRef.current.setRateAsync(speed, true);
                setSettingsView('main');
              }}>
                <Text style={[styles.settingLabel, playbackSpeed === speed && { color: '#fff' }]}>{speed}x</Text>
                {playbackSpeed === speed && <Check size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'quality':
        return (
          <View>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSettingsView('main')}><ChevronRight size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }}/></TouchableOpacity>
              <Text style={styles.modalTitle}>Quality</Text>
              <View style={{ width: 24 }} />
            </View>
            {['Auto', '1080p', '720p', '480p', '360p'].map(q => (
              <TouchableOpacity key={q} style={styles.settingItem} onPress={() => {
                setQuality(q);
                setSettingsView('main');
              }}>
                <Text style={[styles.settingLabel, quality === q && { color: '#fff' }]}>{q}</Text>
                {quality === q && <Check size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'source':
        return (
          <View>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSettingsView('main')}><ChevronRight size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }}/></TouchableOpacity>
              <Text style={styles.modalTitle}>Sources</Text>
              <View style={{ width: 24 }} />
            </View>
            {['Demo', 'Server 1', 'Server 2'].map(src => (
              <TouchableOpacity key={src} style={styles.settingItem} onPress={() => {
                setActiveSource(src);
                setSettingsView('main');
              }}>
                <Text style={[styles.settingLabel, activeSource === src && { color: '#fff' }]}>{src}</Text>
                {activeSource === src && <Check size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return (
          <View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}><X color="#fff" size={20}/></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.settingItem} onPress={() => setSettingsView('speed')}>
              <Text style={styles.settingLabel}>Playback Speed</Text>
              <Text style={styles.settingValue}>{playbackSpeed}x <ChevronRight size={16} color="#999"/></Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => setSettingsView('quality')}>
              <Text style={styles.settingLabel}>Quality</Text>
              <Text style={styles.settingValue}>{quality} <ChevronRight size={16} color="#999"/></Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => setSettingsView('source')}>
              <Text style={styles.settingLabel}>Sources</Text>
              <Text style={styles.settingValue}>{activeSource} <ChevronRight size={16} color="#999"/></Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={isFullscreen ? styles.fullscreenContainer : styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: source }}
        rate={playbackSpeed}
        volume={isMuted ? 0 : volume}
        isMuted={isMuted}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onPlaybackStatusUpdate={setStatus}
        style={styles.video}
      />

      {activeSubtitle !== 'Off' && (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>
            [Subtitles Active: English]
          </Text>
        </View>
      )}

      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.overlay} 
        onPress={resetControlsTimer}
      >
        {showControls && (
          <View style={styles.controlsContainer}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              <View style={styles.topRightIcons}>
                <TouchableOpacity onPress={() => setShowSubtitles(true)} style={styles.iconBtn}>
                  <Subtitles color={activeSubtitle !== 'Off' ? '#fff' : '#999'} size={24} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <MonitorPlay color="#fff" size={24} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setSettingsView('main'); setShowSettings(true); }} style={styles.iconBtn}>
                  <Settings color="#fff" size={24} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.centerControls}>
              <TouchableOpacity onPress={skipBackward} style={styles.centerIcon}>
                <SkipBack color="#fff" size={32} fill="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={togglePlay} style={styles.playPauseBtn}>
                {status.isPlaying ? (
                  <Pause color="#fff" size={48} fill="#fff" />
                ) : (
                  <Play color="#fff" size={48} fill="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={skipForward} style={styles.centerIcon}>
                <SkipForward color="#fff" size={32} fill="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomBar}>
              <View style={styles.progressRow}>
                <Text style={styles.timeText}>{formatTime(status.positionMillis)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={status.durationMillis || 0}
                  value={status.positionMillis || 0}
                  onSlidingStart={() => setIsSeeking(true)}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#FFFFFF"
                />
                <Text style={styles.timeText}>{formatTime(status.durationMillis)}</Text>
              </View>

              <View style={styles.actionsRow}>
                <View style={styles.leftActions}>
                  <TouchableOpacity onPress={togglePlay} style={styles.smallIcon}>
                    {status.isPlaying ? <Pause color="#fff" size={20} fill="#fff" /> : <Play color="#fff" size={20} fill="#fff" />}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleMuteToggle} style={styles.smallIcon}>
                    {isMuted ? <VolumeX color="#fff" size={20} /> : <Volume2 color="#fff" size={20} />}
                  </TouchableOpacity>
                  <Slider
                    style={styles.volumeSlider}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    onValueChange={handleVolumeChange}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor="#FFFFFF"
                  />
                </View>

                <View style={styles.rightActions}>
                  <TouchableOpacity onPress={toggleFullscreen} style={styles.smallIcon}>
                    {isFullscreen ? <Minimize color="#fff" size={20} /> : <Maximize color="#fff" size={20} />}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={showSettings} transparent animationType="slide">
        <View style={styles.modalOverlay}>
           <View style={styles.settingsMenu}>
              {renderSettingsContent()}
           </View>
        </View>
      </Modal>

      <Modal visible={showSubtitles} transparent animationType="slide">
        <View style={styles.modalOverlay}>
           <View style={styles.settingsMenu}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Subtitles</Text>
                <TouchableOpacity onPress={() => setShowSubtitles(false)}><X color="#fff" size={20}/></TouchableOpacity>
              </View>
              {['Off', 'English'].map(sub => (
                <TouchableOpacity 
                  key={sub} 
                  style={[styles.settingItem, activeSubtitle === sub && styles.activeSettingItem]}
                  onPress={() => {
                    setActiveSubtitle(sub);
                    setShowSubtitles(false);
                  }}
                >
                  <Text style={[styles.settingLabel, activeSubtitle === sub && { color: '#fff' }]}>{sub}</Text>
                  {activeSubtitle === sub && <Check size={16} color="#fff" />}
                </TouchableOpacity>
              ))}
           </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: '100%', backgroundColor: '#000' },
  fullscreenContainer: { 
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    backgroundColor: '#000'
  },
  video: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },
  subtitleContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  subtitleText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    fontWeight: '600',
  },
  controlsContainer: { flex: 1, justifyContent: 'space-between', padding: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1, marginLeft: 15 },
  topRightIcons: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 5 },
  centerControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
  centerIcon: { padding: 10 },
  playPauseBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 50, padding: 15 },
  bottomBar: { gap: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeText: { color: '#fff', fontSize: 12, width: 60, textAlign: 'center' },
  slider: { flex: 1, height: 40 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftActions: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  volumeSlider: { width: 100, height: 40 },
  rightActions: { flexDirection: 'row', alignItems: 'center' },
  smallIcon: { padding: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  settingsMenu: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  activeSettingItem: { backgroundColor: '#333', borderRadius: 8, paddingHorizontal: 10 },
  settingLabel: { color: '#999', fontSize: 15, fontWeight: '600' },
  settingValue: { color: '#fff', fontSize: 14, flexDirection: 'row', alignItems: 'center' },
});
