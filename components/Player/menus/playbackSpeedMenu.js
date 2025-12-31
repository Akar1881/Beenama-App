import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, Check } from 'lucide-react-native';

export default function PlaybackSpeedMenu({ currentSpeed, onSelect, onBack }) {
  const speeds = [
    { label: 'Super Slow', value: 0.5 },
    { label: 'Slow', value: 0.75 },
    { label: 'Normal', value: 1.0 },
    { label: 'Fast', value: 1.5 },
    { label: 'Super Fast', value: 2.0 },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onBack}>
        <ChevronLeft color="#fff" size={20} />
        <Text style={styles.headerText}>Playback Speed</Text>
      </TouchableOpacity>
      <ScrollView>
        {speeds.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={styles.item}
            onPress={() => onSelect(item.value)}
          >
            <Text style={[styles.itemText, currentSpeed === item.value && styles.activeText]}>
              {item.label}
            </Text>
            {currentSpeed === item.value && <Check color="#fff" size={16} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 16,
    width: '100%',
    maxWidth: 300,
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemText: {
    color: '#d4d4d4',
    fontSize: 14,
    fontWeight: '500',
  },
  activeText: {
    color: '#fff',
    fontWeight: '700',
  },
});
