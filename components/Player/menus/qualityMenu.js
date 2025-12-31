import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, Check } from 'lucide-react-native';

export default function QualityMenu({ currentQuality, availableQualities, onSelect, onBack }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onBack}>
        <ChevronLeft color="#fff" size={20} />
        <Text style={styles.headerText}>Quality</Text>
      </TouchableOpacity>
      <ScrollView>
        <TouchableOpacity
          style={styles.item}
          onPress={() => onSelect('auto')}
        >
          <Text style={[styles.itemText, currentQuality === 'auto' && styles.activeText]}>
            Auto
          </Text>
          {currentQuality === 'auto' && <Check color="#fff" size={16} />}
        </TouchableOpacity>
        {availableQualities.map((quality) => (
          <TouchableOpacity
            key={quality}
            style={styles.item}
            onPress={() => onSelect(quality)}
          >
            <Text style={[styles.itemText, currentQuality === quality && styles.activeText]}>
              {quality}
            </Text>
            {currentQuality === quality && <Check color="#fff" size={16} />}
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
