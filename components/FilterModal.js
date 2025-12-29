import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { X } from 'lucide-react-native';

const GENRES = {
  movie: [
    { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
    { id: 27, name: 'Horror' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' }
  ],
  tv: [
    { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' }, { id: 10762, name: 'Kids' }, { id: 10765, name: 'Sci-Fi & Fantasy' }
  ]
};

const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popularity.desc' },
  { label: 'Most Rated', value: 'vote_count.desc' },
  { label: 'Highest Rated', value: 'vote_average.desc' },
  { label: 'Newest', value: 'primary_release_date.desc' },
  { label: 'Oldest', value: 'primary_release_date.asc' },
];

const YEARS = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

export default function FilterModal({ visible, onClose, onApply, onReset, currentFilters, type }) {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const toggleGenre = (id) => {
    const genres = localFilters.with_genres || [];
    const newGenres = genres.includes(id) 
      ? genres.filter(g => g !== id)
      : [...genres, id];
    setLocalFilters({ ...localFilters, with_genres: newGenres });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Sort & Filter</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.grid}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity 
                  key={opt.value}
                  style={[styles.chip, localFilters.sort_by === opt.value && styles.activeChip]}
                  onPress={() => setLocalFilters({ ...localFilters, sort_by: opt.value })}
                >
                  <Text style={[styles.chipText, localFilters.sort_by === opt.value && styles.activeChipText]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Genres</Text>
            <View style={styles.grid}>
              {(GENRES[type] || []).map(genre => (
                <TouchableOpacity 
                  key={genre.id}
                  style={[styles.chip, (localFilters.with_genres || []).includes(genre.id) && styles.activeChip]}
                  onPress={() => toggleGenre(genre.id)}
                >
                  <Text style={[styles.chipText, (localFilters.with_genres || []).includes(genre.id) && styles.activeChipText]}>{genre.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearRow}>
              {YEARS.map(year => (
                <TouchableOpacity 
                  key={year}
                  style={[styles.yearChip, localFilters.primary_release_year === year && styles.activeChip]}
                  onPress={() => setLocalFilters({ ...localFilters, primary_release_year: localFilters.primary_release_year === year ? null : year })}
                >
                  <Text style={[styles.chipText, localFilters.primary_release_year === year && styles.activeChipText]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={() => {
              const reset = { sort_by: 'popularity.desc', with_genres: [], include_adult: false, primary_release_year: null };
              setLocalFilters(reset);
              onReset(reset);
            }}>
              <Text style={styles.resetText}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(localFilters)}>
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.92)', 
    justifyContent: 'flex-end',
  },
  content: { 
    backgroundColor: '#000', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    height: '85%', 
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#222',
    elevation: 10,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scroll: { 
    flex: 1,
  },
  sectionTitle: { 
    color: '#888', 
    fontSize: 12, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    marginBottom: 16, 
    marginTop: 28,
    letterSpacing: 1.2,
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12,
    marginBottom: 8,
  },
  chip: { 
    backgroundColor: '#1a1a1a', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 22, 
    borderWidth: 1.5, 
    borderColor: '#333',
  },
  activeChip: { 
    backgroundColor: '#fff', 
    borderColor: '#fff',
  },
  chipText: { 
    color: '#fff', 
    fontSize: 14,
    fontWeight: '500',
  },
  activeChipText: { 
    color: '#000', 
    fontWeight: '700',
  },
  yearRow: { 
    flexDirection: 'row',
  },
  yearChip: { 
    backgroundColor: '#1a1a1a', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 18, 
    marginRight: 12, 
    borderWidth: 1.5, 
    borderColor: '#333',
  },
  adultRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 24, 
    paddingBottom: 40,
  },
  footer: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 24, 
    borderTopWidth: 1, 
    borderTopColor: '#1a1a1a', 
    paddingTop: 20,
  },
  resetBtn: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    backgroundColor: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: '#333',
  },
  applyBtn: { 
    flex: 2, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    backgroundColor: '#fff',
  },
  resetText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 16,
  },
  applyText: { 
    color: '#000', 
    fontWeight: '700', 
    fontSize: 16,
  },
});