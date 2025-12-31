import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const COLORS = ['#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const CAPACITIES = ['0%', '25%', '50%', '75%', '100%'];

export default function CaptionsMenu({ settings, onUpdate, onBack }) {
  const updatePosition = (delta) => {
    const newVal = Math.max(0, Math.min(100, settings.position + delta));
    onUpdate({ position: newVal });
  };

  const updateDelay = (delta) => {
    const newVal = Math.max(-20, Math.min(20, settings.delay + delta));
    onUpdate({ delay: newVal });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onBack}>
        <ChevronLeft color="#fff" size={20} />
        <Text style={styles.headerText}>Captions Customization</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
      >
        <View style={styles.preview}>
          <Text style={[
            styles.previewText,
            {
              color: settings.color,
              fontSize: settings.size === 'XS' ? 10 : settings.size === 'S' ? 12 : settings.size === 'M' ? 14 : settings.size === 'L' ? 18 : 22,
              backgroundColor: `rgba(0,0,0,${parseFloat(settings.backgroundCapacity) / 100})`,
            }
          ]}>
            Preview Text
          </Text>
        </View>

        <Text style={styles.label}>Text Color</Text>
        <View style={styles.colorRow}>
          {COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorCircle, { backgroundColor: c }, settings.color === c && styles.activeBorder]}
              onPress={() => onUpdate({ color: c })}
            />
          ))}
        </View>

        <Text style={styles.label}>Text Size</Text>
        <View style={styles.chipRow}>
          {SIZES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, settings.size === s && styles.activeChip]}
              onPress={() => onUpdate({ size: s })}
            >
              <Text style={[styles.chipText, settings.size === s && styles.activeChipText]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Background Capacity</Text>
        <View style={styles.chipRow}>
          {CAPACITIES.map(cap => (
            <TouchableOpacity
              key={cap}
              style={[styles.chip, settings.backgroundCapacity === cap && styles.activeChip]}
              onPress={() => onUpdate({ backgroundCapacity: cap })}
            >
              <Text style={[styles.chipText, settings.backgroundCapacity === cap && styles.activeChipText]}>{cap}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Position</Text>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => updatePosition(-1)} style={styles.controlBtn}>
            <ChevronLeft color="#fff" size={20} />
          </TouchableOpacity>
          <View style={styles.valueDisplay}>
            <Text style={styles.valueText}>{settings.position}%</Text>
          </View>
          <TouchableOpacity onPress={() => updatePosition(1)} style={styles.controlBtn}>
            <ChevronRight color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Subtitle Delay</Text>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => updateDelay(-1)} style={styles.controlBtn}>
            <ChevronLeft color="#fff" size={20} />
          </TouchableOpacity>
          <View style={styles.valueDisplay}>
            <Text style={styles.valueText}>{settings.delay > 0 ? `+${settings.delay}` : settings.delay}s</Text>
          </View>
          <TouchableOpacity onPress={() => updateDelay(1)} style={styles.controlBtn}>
            <ChevronRight color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 12,
    width: '100%',
    maxWidth: 280,
    maxHeight: 380,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  preview: {
    height: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#333',
  },
  previewText: {
    padding: 2,
  },
  label: {
    color: '#999',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeBorder: {
    borderColor: '#fff',
    borderWidth: 1.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeChip: {
    backgroundColor: '#fff',
  },
  chipText: {
    color: '#d4d4d4',
    fontSize: 10,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#000',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 2,
  },
  controlBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#262626',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueDisplay: {
    minWidth: 50,
    alignItems: 'center',
  },
  valueText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
