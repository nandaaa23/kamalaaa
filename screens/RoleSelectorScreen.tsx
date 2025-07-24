import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import i18n from '../src/i18n/i18n';
interface RoleSelectorScreenProps {
  onSelectRole: (role: 'mother' | 'psychologist') => void;
}

export const RoleSelectorScreen: React.FC<RoleSelectorScreenProps> = ({ onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState<'mother' | 'psychologist' | null>(null);

  const handleSelect = (role: 'mother' | 'psychologist') => {
    setSelectedRole(role); 
    onSelectRole(role); 
  };

  return (
    <View style={styles.container}>
     <Text style={styles.heading}>{i18n.t('whoareyou')}</Text>
      <TouchableOpacity
        style={[
          styles.roleButton,
          selectedRole === 'mother' && styles.selectedButton,
        ]}
        onPress={() => handleSelect('mother')}
      >
        <Text style={styles.roleText}>{i18n.t('mother')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.roleButton,
          selectedRole === 'psychologist' && styles.selectedButton,
        ]}
        onPress={() => handleSelect('psychologist')}
      >
       <Text style={styles.roleText}>{i18n.t('Psychologist')}</Text>
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
    color: Colors.jet,
    marginBottom: 24,
    justifyContent: 'center',
    marginLeft:18,
    
  },
  roleButton: {
    width: '90%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E8B4CB',
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
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});