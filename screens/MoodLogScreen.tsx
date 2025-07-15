import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { MoodSelector } from '../components/MoodSelector';
import { BackButton } from '../components/BackButton';
import { useData } from '../contexts/DataContext';

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

    // Show validating message
    const messages = {
      happy: "It's wonderful to see you feeling okay today. Keep nurturing these moments. 🌸",
      down: "It's okay to feel down. You're being gentle with yourself by checking in. 💙",
      overwhelmed: "Feeling overwhelmed is valid. Take a deep breath. You're doing your best. 🌊",
      numb: "Sometimes numbness is protection. You're still showing up for yourself. 🤍",
    };

    Alert.alert('Thank you for sharing', messages[mood]);
    
    // Show streak info
    const streak = getMoodStreak();
    if (streak > 1) {
      setTimeout(() => {
        Alert.alert('Keep going!', `You've checked in ${streak} days in a row — you're showing up for yourself. 🌟`);
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>Mood Log</Text>
        <Text style={styles.subtitle}>
          Your emotions are valid. Let's check in together.
        </Text>
      </View>

      <MoodSelector onMoodSelect={handleMoodSelect} />

      <View style={styles.streakInfo}>
        <Text style={styles.streakText}>
          Current streak: {getMoodStreak()} days
        </Text>
        <Text style={styles.streakSubtext}>
          Small steps, big healing. Keep going.
        </Text>
      </View>
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