import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { MoodSelector } from '../components/MoodSelector';
import { BackButton } from '../components/BackButton';
import { useData } from '../contexts/DataContext';
import i18n from '../app/src/i18n/i18n';

export const MoodLogScreen: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<'happy' | 'down' | 'overwhelmed' | 'numb' | null>(null);
  const { addMoodEntry, getMoodStreak } = useData();

  const handleMoodSelect = async (mood: 'happy' | 'down' | 'overwhelmed' | 'numb') => {
    setSelectedMood(mood);
    
    const today = new Date().toISOString().split('T')[0];
    await addMoodEntry({
      date: today,
      mood: mood,
    });

    Alert.alert(
      i18n.t('thankYou'),
      i18n.t(`moodMessages.${mood}`)
    );
    
    const streak = getMoodStreak();
    if (streak > 1) {
      setTimeout(() => {
        Alert.alert(
          i18n.t('streakTitle'),
          i18n.t('streakMessage', { streak })
        );        
      }, 1500);
    }
  };

  const streak = getMoodStreak();

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('mood')}</Text>
        <Text style={styles.subtitle}>
         {i18n.t('moodemo')}</Text>
      </View>

      <MoodSelector onMoodSelect={handleMoodSelect} />

      {streak >= 2 && (
        <View style={styles.streakInfo}>
          <Text style={styles.streakText}>
            {i18n.t('streak')} {streak} {i18n.t('day')}
          </Text>
          <Text style={styles.streakSubtext}>
            {i18n.t('mls')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.jet,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  streakInfo: {
    padding: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 4,
  },
  streakSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
