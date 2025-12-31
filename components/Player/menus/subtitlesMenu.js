import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, Check } from 'lucide-react-native';

export default function SubtitlesMenu({ currentSubtitle, availableSubtitles, onSelect, onBack }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onBack}>
        <ChevronLeft color="#fff" size={20} />
        <Text style={styles.headerText}>Subtitles</Text>
      </TouchableOpacity>
      <ScrollView>
        <TouchableOpacity
          style={styles.item}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.itemText, currentSubtitle === null && styles.activeText]}>
            NONE
          </Text>
          {currentSubtitle === null && <Check color="#fff" size={16} />}
        </TouchableOpacity>
        {availableSubtitles.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            style={styles.item}
            onPress={() => onSelect(sub)}
          >
            <Text style={[styles.itemText, currentSubtitle?.id === sub.id && styles.activeText]}>
              {sub.label}
            </Text>
            {currentSubtitle?.id === sub.id && <Check color="#fff" size={16} />}
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
