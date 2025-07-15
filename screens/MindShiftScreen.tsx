import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import { useData } from '../contexts/DataContext';

export const MindShiftScreen: React.FC = () => {
  const [thought, setThought] = useState('');
  const [reframes, setReframes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { reframeThought } = useData();

  const handleReframe = async () => {
    if (!thought.trim()) return;
    
    setIsLoading(true);
    try {
      const newReframes = await reframeThought(thought);
      setReframes(newReframes);
    } catch (error) {
      console.error('Error reframing thought:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setThought('');
    setReframes([]);
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

        {reframes.length > 0 && (
          <View style={styles.reframesSection}>
            <Text style={styles.originalThought}>
              You said: "{thought}"
            </Text>
            
            <View style={styles.reframes}>
              {reframes.map((reframe, index) => (
                <View key={index} style={styles.reframeCard}>
                  <Text style={styles.reframeText}>{reframe}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.buttons}>
          {reframes.length === 0 ? (
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
  reframes: {
    gap: 12,
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