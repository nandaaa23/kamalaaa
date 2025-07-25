import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../src/i18n/i18n';

interface AuthScreenProps {
  onComplete: (authenticatedUser?: User) => void;
}

const LoginModal = ({ visible, onClose, onSwitch, onLoginSuccess }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert(i18n.t('errorTitle'), i18n.t('fillAllFields'));

     

    setIsLoading(true);
    try {
      const user = await login(email.trim(), password.trim());
      onClose();
      onLoginSuccess(user);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{i18n.t('login')}</Text>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder={i18n.t('passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
            {isLoading ? i18n.t('loggingIn') : i18n.t('login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSwitch} disabled={isLoading}>
          <Text style={styles.linkText}>{i18n.t('noAccountRegister')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const RegisterModal = ({ visible, onClose, onSwitch, onRegisterSuccess }: any) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm)
       return  Alert.alert(i18n.t('errorTitle'), i18n.t('fillAllFields'));
    

    if (password !== confirm)
      
      return Alert.alert(i18n.t('errorTitle'), i18n.t('passwordTooShort'));
    

    if (password.length < 6) {
     
      return Alert.alert(i18n.t('errorTitle'), i18n.t('passwordTooShort'));
    }

    setIsLoading(true);
    try {
      const storedRole = await AsyncStorage.getItem('selected_role');
      const selectedRole: 'mother' | 'psychologist' = storedRole === 'psychologist' ? 'psychologist' : 'mother';

      const user = await register(name.trim(), email.trim(), password.trim(), selectedRole);  
      Alert.alert('Success', 'Account created! Please log in.');
      
      onClose();
      
      
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{i18n.t('createAccount')}</Text>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('yourName')}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder={i18n.t('email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder={i18n.t('passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder={i18n.t('confirmPassword')}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
            {isLoading ? i18n.t('creatingAccount') : i18n.t('register')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSwitch} disabled={isLoading}>
          <Text style={styles.linkText}>{i18n.t('alreadyHaveAccount')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const AuthScreen = ({ onComplete }: AuthScreenProps) => {
  const { enterGuestMode, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleGuestMode = async () => {
  const selectedRole = (await AsyncStorage.getItem('selected_role')) as 'mother' | 'psychologist' || 'mother';
  const user = await enterGuestMode(selectedRole);
  onComplete(user);
};

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>{i18n.t('welcome')}</Text>
        <Text style={styles.tagline}>{i18n.t('subtitle')}</Text>

        <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
  {i18n.t('welcomeMessage')}
</Text>

        </View>

        <View style={styles.authButtons}>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: '#E8B4CB' }]}
            onPress={() => setShowLogin(true)}
          >
            <Text style={styles.authButtonText}>{i18n.t('login')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: '#E8B4CB' }]}
            onPress={() => setShowRegister(true)}
          >
          <Text style={styles.authButtonText}>{i18n.t('register')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreButton}
            onPress={handleGuestMode}
          ><Text style={styles.exploreButtonText}>{i18n.t('exploreKamala')}</Text>
            
          </TouchableOpacity>
        </View>
      </View>

      <LoginModal
        visible={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitch={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
        onLoginSuccess={onComplete}
      />

      <RegisterModal
        visible={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitch={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  logo: {
    fontSize: 48, fontWeight: 'bold', color: '#2D3748', marginBottom: 60,
  },
  tagline: {
    fontSize: 18, color: '#718096', fontStyle: 'italic', marginBottom: 40,
  },
  welcomeSection: {
    marginBottom: 40
  },
  welcomeText: {
    fontSize: 20, color: '#2D3748', textAlign: 'center', lineHeight: 28,
  },
  authButtons: { width: '100%', gap: 16 },
  authButton: {
    paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 16,
  },
  authButtonText: {
    fontSize: 16, fontWeight: '600', color: 'white',
  },
  exploreButton: {
    backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  exploreButtonText: {
    fontSize: 16, fontWeight: '600', color: '#718096',
  },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  closeButton: { fontSize: 24, color: '#666', marginRight: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
  modalContent: {
    flex: 1, padding: 40, justifyContent: 'center',
  },
  input: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12,
    padding: 16, marginBottom: 16, fontSize: 16, backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#E8B4CB', padding: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 20,
  },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  linkText: { textAlign: 'center', color: '#E8B4CB', fontSize: 16 },
});

export default AuthScreen;