import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import i18n from '../src/i18n/i18n';


export const ReflectionsScreen: React.FC = () => {
  const [reflection, setReflection] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const { addReflection, reflections } = useData();
  const { user } = useAuth();

  if (user?.isGuest) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.lockedScreen}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>{i18n.t('lockJournalTitle')}</Text>
           <Text style={styles.lockDescription}>{i18n.t('lockJournalDescription')}</Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>{i18n.t('joinKamala')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const moods = ['😊', '😞', '😤', '💭', '😌', '😔'];

  const handleSave = async () => {
    if (!reflection.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    await addReflection({
      date: today,
      content: reflection,
      mood: selectedMood,
    });
    Alert.alert(i18n.t('journalSavedTitle'), i18n.t('journalSavedMessage'));
    setReflection('');
    setSelectedMood('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
      <Text style={styles.title}>{i18n.t('reflectionsTitle')}</Text>
<Text style={styles.subtitle}>{i18n.t('reflectionsSubtitle')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.writingSection}>
        <Text style={styles.promptText}>{i18n.t('hft')}</Text>
          
          <View style={styles.moodSelector}>
            {moods.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodButton,
                  selectedMood === mood && styles.selectedMoodButton,
                ]}
                onPress={() => setSelectedMood(mood)}
              >
                <Text style={styles.moodEmoji}>{mood}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.textInput}
            placeholder={i18n.t('journalPlaceholder')}
            placeholderTextColor={Colors.textSecondary}
            value={reflection}
            onChangeText={setReflection}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.saveButton, !reflection.trim() && styles.disabledButton]}
            onPress={handleSave}
            disabled={!reflection.trim()}
          >
          <Text style={styles.saveButtonText}>{i18n.t('saveReflection')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pastReflections}>
        <Text style={styles.sectionTitle}>{i18n.t('recentReflections')}</Text>
          {reflections.slice(-5).reverse().map((item) => (
            <View key={item.id} style={styles.reflectionCard}>
              <View style={styles.reflectionHeader}>
                <Text style={styles.reflectionDate}>{item.date}</Text>
                {item.mood && <Text style={styles.reflectionMood}>{item.mood}</Text>}
              </View>
              <Text style={styles.reflectionContent} numberOfLines={3}>
                {item.content}
              </Text>
            </View>
          ))}
          {reflections.length === 0 && (
            <Text style={styles.emptyText}>
            {i18n.t('reflectionsEmpty')}
          </Text>          
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
  lockedScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.jet,
    marginBottom: 12,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
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
  writingSection: {
    marginBottom: 32,
  },
  promptText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 16,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  moodButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMoodButton: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  moodEmoji: {
    fontSize: 20,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 150,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
  pastReflections: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 16,
  },
  reflectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reflectionDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reflectionMood: {
    fontSize: 18,
  },
  reflectionContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
  },
});