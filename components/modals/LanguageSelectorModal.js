import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const LanguageSelectorModal = ({ visible, onClose, onSelectLanguage }) => {
  const LANGUAGES = [
    { code: 'english', name: 'English' },
    { code: 'hindi', name: 'हिंदी' },
    { code: 'tamil', name: 'தமிழ்' },
    { code: 'bengali', name: 'বাংলা' }
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Choose Language</Text>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.button}
            onPress={() => {
              onSelectLanguage(lang.code);
              onClose();
            }}
          >
            <Text>{lang.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 50,
    padding: 20,
    borderRadius: 10
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  button: { padding: 10, marginVertical: 5, backgroundColor: '#f0f0f0' }
});

export default LanguageSelectorModal;