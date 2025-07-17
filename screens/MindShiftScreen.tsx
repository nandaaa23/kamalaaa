import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TextInput, TouchableOpacity, ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import { reframeThought } from '../services/reframeThought';

export const MindShiftScreen = () => {
  const [thought, setThought] = useState('');
  const [response, setResponse] = useState({ reframe: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleReframe = async () => {
    if (!thought.trim()) return;

    setIsLoading(true);
    try {
      const result = await reframeThought(thought);
      setResponse(result);
    } catch (error) {
      console.error('Error reframing thought:', error);
      setResponse({ reframe: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setThought('');
    setResponse({ reframe: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>MindShift</Text>
        <Text style={styles.subtitle}>
          Gently reframe heavy thoughts with compassion.
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>What thought is weighing on you today?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="I feel like..."
            placeholderTextColor={Colors.textSecondary}
            value={thought}
            onChangeText={setThought}
            multiline
            textAlignVertical="top"
          />
        </View>

        {response.reframe && (
          <View style={styles.reframesSection}>
            <Text style={styles.originalThought}>
              You said: "{thought}"
            </Text>

            <View style={styles.reframeCard}>
              <Text style={styles.reframeText}>{response.reframe}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttons}>
          {!response.reframe ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleReframe}
              disabled={!thought.trim() || isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Reframing...' : 'Reframe This Thought'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleTryAgain}
              >
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => console.log('Done')}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reframesSection: {
    marginBottom: 24,
  },
  originalThought: {
    fontSize: 16,
    color: Colors.textSecondary,
    opacity: 0.7,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  reframeCard: {
    backgroundColor: Colors.mintCream,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reframeText: {
    fontSize: 16,
    color: Colors.jet,
    lineHeight: 24,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  buttons: {
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
