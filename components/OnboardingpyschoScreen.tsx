import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Colors } from '../constants/Colors';
import { UserProfile } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 
 
interface OnboardingpsychoScreenProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingpsychoScreen: React.FC<OnboardingpsychoScreenProps> = ({ onComplete }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1927 + 1 }, (_, i) => 1927 + i);

  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  const handleChange = (key: keyof UserProfile, value: string) => {
    console.log(`📝 Field changed: ${key} -> ${value}`);
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async() => {
    console.log('🔍 Submitted profile:', profile);

    const requiredFields: (keyof UserProfile)[] = [
      'displayName', 'specialization', 'gender', 'city', 'language',
      'registrationNumber', 'registrationCouncil', 'registrationYear',
      'degree', 'college', 'completionYear', 'experience', 'diploma'
    ];

    const missing = requiredFields.filter((field) => !profile[field]);
    if (missing.length > 0) {
      console.log('⚠️ Missing fields:', missing);
      Alert.alert('Please fill all fields.', `Missing: ${missing.join(', ')}`);
      return;
    }

    try {
    const docRef = await addDoc(collection(db, 'psychologist_profiles'), profile);
    console.log('✅ Profile saved with ID: ', docRef.id);
    Alert.alert('Success', 'Profile submitted successfully!');
    onComplete(profile as UserProfile);
  } catch (error) {
    console.error('❌ Error saving profile:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }

    onComplete(profile as UserProfile);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Psychologist Registration</Text>

      <TextInput style={styles.input} placeholder="Full Name" onChangeText={(v) => handleChange('displayName', v)} />
      <TextInput style={styles.input} placeholder="Specialization" onChangeText={(v) => handleChange('specialization', v)} />

      <RNPickerSelect
        onValueChange={(v) => handleChange('gender', v)}
        value={profile.gender || null}
        items={['Male', 'Female', 'Other'].map((g) => ({ label: g, value: g }))}
        placeholder={{ label: 'Select Gender', value: null }}
        style={pickerStyles}
      />

      <TextInput style={styles.input} placeholder="City" onChangeText={(v) => handleChange('city', v)} />

      <RNPickerSelect
        onValueChange={(v) => handleChange('language', v)}
        value={profile.language || null}
        items={['English', 'Hindi', 'Tamil', 'Malayalam', 'Kannada', 'Bengali'].map((l) => ({ label: l, value: l }))}
        placeholder={{ label: 'Preferred Language', value: null }}
        style={pickerStyles}
      />

      <TextInput
        style={styles.input}
        placeholder="Medical Registration Number"
        onChangeText={(v) => handleChange('registrationNumber', v)}
      />

      <RNPickerSelect
        onValueChange={(v) => handleChange('registrationCouncil', v)}
        value={profile.registrationCouncil || null}
        items={['Maharashtra Medical Council', 'Delhi Medical Council', 'Karnataka Medical Council'].map((c) => ({ label: c, value: c }))}
        placeholder={{ label: 'Registration Council', value: null }}
        style={pickerStyles}
      />

      <RNPickerSelect
        onValueChange={(v) => handleChange('registrationYear', v?.toString())}
        value={profile.registrationYear || null}
        items={years.map((y) => ({ label: y.toString(), value: y.toString() }))}
        placeholder={{ label: 'Registration Year', value: null }}
        style={pickerStyles}
      />

      <TextInput style={styles.input} placeholder="Degree" onChangeText={(v) => handleChange('degree', v)} />
      <TextInput style={styles.input} placeholder="College / Institute" onChangeText={(v) => handleChange('college', v)} />

      <RNPickerSelect
        onValueChange={(v) => handleChange('completionYear', v?.toString())}
        value={profile.completionYear || null}
        items={years.map((y) => ({ label: y.toString(), value: y.toString() }))}
        placeholder={{ label: 'Year of Completion', value: null }}
        style={pickerStyles}
      />

      <RNPickerSelect
        onValueChange={(v) => handleChange('experience', v?.toString())}
        value={profile.experience || null}
        items={Array.from({ length: 41 }, (_, i) => i).map((y) => ({ label: `${y} years`, value: `${y}` }))}
        placeholder={{ label: 'Years of Experience', value: null }}
        style={pickerStyles}
      />

      <RNPickerSelect
        onValueChange={(v) => handleChange('diploma', v)}
        value={profile.diploma || null}
        items={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
        placeholder={{ label: 'Post Graduate Diploma in Counseling?', value: null }}
        style={pickerStyles}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: Colors.background },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: Colors.jet },
  input: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { fontSize: 18, fontWeight: '600', color: Colors.jet },
});

const pickerStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    marginBottom: 16,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    marginBottom: 16,
  },
};
