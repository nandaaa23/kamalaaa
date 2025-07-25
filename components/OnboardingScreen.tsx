import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { UserProfile } from '../types';
import i18n from '../src/i18n/i18n';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';


interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { user } = useAuth();
  
const [selectedLanguage, setSelectedLanguage] = useState('');
const [hasPastChildbirth, setHasPastChildbirth] = useState(false);
const [weekPostpartum, setWeekPostpartum] = useState<number | null>(null);
const [groupPreference, setGroupPreference] = useState('');
const [quizResponses, setQuizResponses] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    currentFeelings: [],
    interests: [],
  });

  const steps = [
    {
      title: i18n.t('journeyStageTitle'),
      type: 'single',
      key: 'journeyStage',
      options: [
        'days1to10',
        'days10to21',
        'weeks3to6',
        'weeks6to8',
        'months2to3',
        'moreThan3Months',
      ],
    },
    {
      title: i18n.t('feelingQuestion'),
      type: 'multiple',
      key: 'currentFeelings',
      options: ['anxious', 'lonely', 'tired', 'numb', 'okay', 'hopeful'],
    },
    {
      title: i18n.t('topicsInterested'),
      type: 'multiple',
      key: 'interests',
      options: [
        'stress',
        'recovery',
        'breastfeeding',
        'sleep',
        'bodyImage',
        'relationships',
        'mood',
        'work',
        'nutrition',
        'familyTalk',
      ],
    },
    {
      title: i18n.t('languageTitle'),
      type: 'single',
      key: 'language',
     options: ['en', 'hi', 'ta', 'te', 'bn', 'kn', 'ml', 'mr', 'gu', 'pa'],
    },
    {
      title: i18n.t('displayNameTitle'),
      type: 'text',
      key: 'displayName',
      placeholder: i18n.t('displayNamePlaceholder'),
    },
  ];

  const saveOnboardingData = async () => {
  if (!user?.id) {
    console.error('User not logged in');
    return;
  }

  try {
    await setDoc(doc(db, 'userOnboarding', user.id), {
      userId: user.id,
      ...profile,
      weekPostpartum,
      groupPreference,
      createdAt: serverTimestamp(),
    });

    console.log("✅ Onboarding data saved");
  } catch (err) {
    console.error("❌ Failed to save onboarding:", err);
  }
};


  const currentStepData = steps[currentStep];

  const handleSelection = (value: string) => {
    if (currentStepData.type === 'single' || currentStepData.type === 'text') {
      setProfile((prev) => ({ ...prev, [currentStepData.key]: value }));
    } else if (currentStepData.type === 'multiple') {
      const currentValues = (profile[currentStepData.key as keyof UserProfile] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      setProfile((prev) => ({ ...prev, [currentStepData.key]: newValues }));
    }
  };

  const handleNext = async () => {
  if (currentStep < steps.length - 1) {
    setCurrentStep(currentStep + 1);
  } else {
    await saveOnboardingData();  // ✅ Save answers to Firestore
    onComplete(profile as UserProfile); // ✅ Continue flow
  }
};


  const canProceed = () => {
    const value = profile[currentStepData.key as keyof UserProfile];
    if (currentStepData.type === 'multiple') {
      return Array.isArray(value) && value.length > 0;
    }
    return value && value !== '';
  };


  const renderOptions = () => {
    if (currentStepData.type === 'text') {
      return (
        <TextInput
          style={styles.textInput}
          placeholder={currentStepData.placeholder}
          value={(profile[currentStepData.key as keyof UserProfile] as string) || ''}
          onChangeText={(text) => handleSelection(text)}
          placeholderTextColor={Colors.textSecondary}
        />
      );
    }

    return currentStepData.options?.map((option, index) => {
      const isSelected =
        currentStepData.type === 'multiple'
          ? (profile[currentStepData.key as keyof UserProfile] as string[])?.includes(option)
          : profile[currentStepData.key as keyof UserProfile] === option;

      return (
        <TouchableOpacity
          key={index}
          style={[styles.option, isSelected && styles.selectedOption]}
          onPress={() => handleSelection(option)}
        >
          <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
            {i18n.t(`${currentStepData.key}Options.${option}`)}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('yourJourney')}</Text>
        <Text style={styles.progress}>
          {currentStep + 1} {i18n.t('of')} {steps.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.question}>{currentStepData.title}</Text>
        <View style={styles.options}>{renderOptions()}</View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.nextButton, !canProceed() && styles.disabledButton]}
        onPress={handleNext}
        disabled={!canProceed()}
      >
        <Text style={styles.nextButtonText}>
          {currentStep === steps.length - 1 ? i18n.t('complete') : i18n.t('next')}
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
