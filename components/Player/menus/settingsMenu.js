import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function SettingsMenu({ onNavigate, onBack }) {
  const options = [
    { id: 'playbackSpeed', label: 'Playback Speed', icon: ChevronRight },
    { id: 'captions', label: 'Captions', icon: ChevronRight },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onBack}>
        <ChevronLeft color="#fff" size={20} />
        <Text style={styles.headerText}>Settings</Text>
      </TouchableOpacity>
      <ScrollView>
        {options.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onNavigate(item.id)}
          >
            <Text style={styles.itemText}>{item.label}</Text>
            <item.icon color="#999" size={18} />
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
