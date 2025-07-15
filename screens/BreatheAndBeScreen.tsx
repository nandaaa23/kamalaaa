import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import { useRouter } from 'expo-router';

export const BreatheAndBeScreen: React.FC = () => {
  const router = useRouter();

  const exercises = [
    {
      title: 'MindShift',
      description: 'Gently reframe heavy thoughts',
      icon: '🌥',
      color: Colors.lightCyan,
      screen: 'MindShiftScreen',
    },
    {
      title: 'Echo Our Heartbeats',
      description: 'Feel your rhythm. Feel your bond.',
      icon: '💓',
      color: Colors.mistyRose,
      screen: 'HeartbeatEchoScreen',
    },
    {
      title: 'Guilt Release Bubbles',
      description: 'Pop what you\'re carrying. Let a little go.',
      icon: '🫧',
      color: Colors.pinkLavender1,
      screen: 'GuiltReleaseBubblesScreen',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>Breathe & Be</Text>
        <Text style={styles.subtitle}>
          Gentle practices to calm, center, and nurture you.
        </Text>
      </View>

      <View style={styles.exercises}>
        {exercises.map((exercise, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.exerciseCard, { backgroundColor: exercise.color }]}
            onPress={() => router.push(`/${exercise.screen}`)}
          >
            <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
            <View style={styles.exerciseContent}>
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    lineHeight: 24,
  },
  exercises: {
    padding: 20,
    paddingTop: 0,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseIcon: {
    fontSize: 36,
    marginRight: 20,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});