import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';
import { UserProfile } from '../types';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    currentFeelings: [],
    interests: [],
  });

  const steps = [
    {
      title: 'How far along are you?',
      type: 'single',
      key: 'journeyStage',
      options: [
        '1–10 days',
        '10–21 days',
        '3–6 weeks',
        '6–8 weeks',
        '2–3 months',
        'More than 3 months',
      ],
    },
    {
      title: 'How are you feeling lately?',
      type: 'multiple',
      key: 'currentFeelings',
      options: ['Anxious', 'Lonely', 'Tired', 'Numb', 'Okay', 'Hopeful'],
    },
    {
      title: 'Topics you\'re interested in',
      type: 'multiple',
      key: 'interests',
      options: [
        'Managing stress',
        'Physical recovery',
        'Breastfeeding support',
        'Sleep & fatigue',
        'Body image',
        'Relationship changes',
        'Mood swings & anxiety',
        'Returning to work',
        'Nutrition & self-care',
        'Talking to family about emotions',
      ],
    },
    {
      title: 'Preferred language',
      type: 'single',
      key: 'language',
      options: [
        'English',
        'Hindi',
        'Tamil',
        'Telugu',
        'Bengali',
        'Kannada',
        'Malayalam',
        'Marathi',
        'Gujarati',
        'Punjabi',
      ],
    },
    {
      title: 'What should we call you?',
      type: 'text',
      key: 'displayName',
      placeholder: 'Enter your name',
    },
  ];

  const currentStepData = steps[currentStep];

  const handleSelection = (value: string) => {
    if (currentStepData.type === 'single' || currentStepData.type === 'text') {
      setProfile(prev => ({ ...prev, [currentStepData.key]: value }));
    } else if (currentStepData.type === 'multiple') {
      const currentValues = profile[currentStepData.key as keyof UserProfile] as string[] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setProfile(prev => ({ ...prev, [currentStepData.key]: newValues }));
    }
  };

  const canProceed = () => {
    const value = profile[currentStepData.key as keyof UserProfile];
    if (currentStepData.type === 'multiple') {
      return Array.isArray(value) && value.length > 0;
    }
    return value && value !== '';
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(profile as UserProfile);
    }
  };

  const renderOptions = () => {
    if (currentStepData.type === 'text') {
      return (
        <TextInput
          style={styles.textInput}
          placeholder={currentStepData.placeholder}
          value={profile[currentStepData.key as keyof UserProfile] as string || ''}
          onChangeText={(text) => handleSelection(text)}
          placeholderTextColor={Colors.textSecondary}
        />
      );
    }

    return currentStepData.options?.map((option, index) => {
      const isSelected = currentStepData.type === 'multiple'
        ? (profile[currentStepData.key as keyof UserProfile] as string[])?.includes(option)
        : profile[currentStepData.key as keyof UserProfile] === option;

      return (
        <TouchableOpacity
          key={index}
          style={[styles.option, isSelected && styles.selectedOption]}
          onPress={() => handleSelection(option)}
        >
          <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
            {option}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Journey</Text>
        <Text style={styles.progress}>
          {currentStep + 1} of {steps.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.question}>{currentStepData.title}</Text>
        <View style={styles.options}>
          {renderOptions()}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.nextButton, !canProceed() && styles.disabledButton]}
        onPress={handleNext}
        disabled={!canProceed()}
      >
        <Text style={styles.nextButtonText}>
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.jet,
  },
  progress: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedOptionText: {
    color: Colors.jet,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
  },
});