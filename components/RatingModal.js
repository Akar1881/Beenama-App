import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { X, Star } from 'lucide-react-native';
import { rateMovie } from '../services/authService';

export default function RatingModal({ visible, onClose, sessionId, mediaId, mediaType, onRatingSubmitted }) {
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const success = await rateMovie(sessionId, mediaId, rating);
      if (success && onRatingSubmitted) {
        onRatingSubmitted(rating);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Rate this {mediaType === 'movie' ? 'Movie' : 'TV Show'}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.ratingGrid}>
            {ratings.map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.ratingBtn, rating === val && styles.selectedBtn]}
                onPress={() => setRating(val)}
              >
                <Text style={[styles.ratingText, rating === val && styles.selectedText]}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.displayRow}>
            <Star size={24} color="#FFD700" fill="#FFD700" />
            <Text style={styles.displayVal}>{rating}/10</Text>
          </View>

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  ratingBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedBtn: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  ratingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedText: {
    color: '#000',
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  displayVal: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 10,
  },
  submitBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
  },
  submitBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});