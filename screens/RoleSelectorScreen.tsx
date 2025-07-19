import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';

interface RoleSelectorScreenProps {
  onSelectRole: (role: 'mother' | 'psychologist') => void;
}

export const RoleSelectorScreen: React.FC<RoleSelectorScreenProps> = ({ onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState<'mother' | 'psychologist' | null>(null);

  const handleSelect = (role: 'mother' | 'psychologist') => {
    setSelectedRole(role); // updates visual state
    onSelectRole(role); // passes it back to layout
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Who are you?</Text>
      <TouchableOpacity
        style={[
          styles.roleButton,
          selectedRole === 'mother' && styles.selectedButton,
        ]}
        onPress={() => handleSelect('mother')}
      >
        <Text style={styles.roleText}>Mother</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.roleButton,
          selectedRole === 'psychologist' && styles.selectedButton,
        ]}
        onPress={() => handleSelect('psychologist')}
      >
        <Text style={styles.roleText}>Psychologist</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoleSelectorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 24,
  },
  roleButton: {
    width: '80%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
});