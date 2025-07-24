import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import i18n from '../src/i18n/i18n';

interface MoodSelectorProps {
  onMoodSelect: (mood: 'happy' | 'down' | 'overwhelmed' | 'numb') => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onMoodSelect }) => {
  const moods = [
    { key: 'happy', emoji: '😊', label: i18n.t('moodLabels.happy'), color: Colors.moodHappy },
    { key: 'down', emoji: '😞', label: i18n.t('moodLabels.down'), color: Colors.moodDown },
    { key: 'overwhelmed', emoji: '😤', label: i18n.t('moodLabels.overwhelmed'), color: Colors.moodOverwhelmed },
    { key: 'numb', emoji: '💭', label: i18n.t('moodLabels.numb'), color: Colors.moodNumb },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('moodQuestion')}</Text>
      <View style={styles.moodGrid}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.key}
            style={[styles.moodButton, { backgroundColor: mood.color }]}
            onPress={() => onMoodSelect(mood.key as any)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.jet,
    textAlign: 'center',
    marginBottom: 24,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
});
