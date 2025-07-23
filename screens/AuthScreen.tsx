import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../app/src/i18n/i18n';

interface AuthScreenProps {
  onComplete?: (user?: User) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'mother' | 'psychologist';
  isGuest: boolean;
  onboardingComplete: boolean;
  profile?: any;
  createdAt?: string;
}

const LoginModal = ({ visible, onClose, onRegister, onSuccess }: {
  visible: boolean;
  onClose: () => void;
  onRegister: () => void;
  onSuccess: (userData: { name: string; email: string }) => void;
}) => {
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert(i18n.t('errorTitle'), i18n.t('fillAllFields'));

      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        i18n.t('success'),
        `${i18n.t('welcome')}, ${name.trim()}!`,
        [
        { text: i18n.t('ok'), onPress: () => {
          onClose();
          onSuccess({
            name: name.trim(),
            email: email.trim()
          });
        }}
      ]);
    }, 1000);
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
            placeholder={i18n.t('yourName')}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder={i18n.t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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

          <TouchableOpacity onPress={onRegister} disabled={isLoading}>
          <Text style={styles.linkText}>{i18n.t('noAccountRegister')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const RegisterModal = ({ visible, onClose, onLogin }: {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
}) => {
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert(i18n.t('errorTitle'), i18n.t('fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(i18n.t('errorTitle'), i18n.t('passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(i18n.t('errorTitle'), i18n.t('passwordTooShort'));
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        i18n.t('successTitle'),
        i18n.t('accountCreated', { name: name.trim() }),
        [
        {
          text: i18n.t('ok'),
          onPress: () => {
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            onClose();
            onLogin();
          }
        }
      ]);
    }, 1000);
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
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder={i18n.t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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

          <TouchableOpacity onPress={onLogin} disabled={isLoading}>
          <Text style={styles.linkText}>{i18n.t('alreadyHaveAccount')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const AuthScreen: React.FC<AuthScreenProps> = ({ onComplete }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  console.log('🎉 AuthScreen from screens/ loaded successfully!');

  const handleLogin = () => {
    console.log('🔐 Opening login modal...');
    setShowLogin(true);
  };

  const handleRegister = () => {
    console.log('📝 Opening register modal...');
    setShowRegister(true);
  };

  const handleExplore = async () => {
    console.log('👀 Explore button pressed - entering guest mode');
    
    const selectedRole = await AsyncStorage.getItem('selected_role');
    const guestUser: User = {
      id: 'guest',
      name: 'Guest',
      email: '',
      role: (selectedRole as 'mother' | 'psychologist') || 'mother',
      isGuest: true,
      onboardingComplete: true,
      profile: {},
      createdAt: new Date().toISOString()
    };
    
    console.log('👤 Created guest user:', guestUser);
    await AsyncStorage.setItem('user', JSON.stringify(guestUser));
    console.log('💾 Guest user saved to AsyncStorage');
    
    if (onComplete) {
      onComplete(guestUser);
    }
  };

  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleAuthSuccess = async (userData: { name: string; email: string }) => {
    console.log('🎉 Authentication successful');
    
    const selectedRole = await AsyncStorage.getItem('selected_role');
    const authUser: User = {
      id: 'auth_user_' + Date.now(),
      name: userData.name, 
      email: userData.email, 
      role: (selectedRole as 'mother' | 'psychologist') || 'mother',
      isGuest: false,
      onboardingComplete: selectedRole === 'psychologist', 
      profile: selectedRole === 'psychologist' ? {} : undefined,
      createdAt: new Date().toISOString()
    };
    
    console.log('👤 Created user object:', authUser);
    await AsyncStorage.setItem('user', JSON.stringify(authUser));
    console.log('💾 User saved to AsyncStorage');
    
    setShowLogin(false);
    setShowRegister(false);
    
    if (onComplete) {
      onComplete(authUser);
    }
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
            onPress={handleLogin}
          >
            <Text style={styles.authButtonText}>{i18n.t('login')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: '#E8B4CB' }]}
            onPress={handleRegister}
          >
          <Text style={styles.authButtonText}>{i18n.t('register')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreButton}
            onPress={handleExplore}
          ><Text style={styles.exploreButtonText}>{i18n.t('exploreKamala')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <LoginModal 
        visible={showLogin} 
        onClose={() => setShowLogin(false)}
        onRegister={switchToRegister}
        onSuccess={handleAuthSuccess}
      />

      <RegisterModal 
        visible={showRegister} 
        onClose={() => setShowRegister(false)}
        onLogin={switchToLogin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 60,
  },
  tagline: {
    fontSize: 18,
    color: '#718096',
    fontStyle: 'italic',
    marginBottom: 40,
  },
  welcomeSection: {
    marginBottom: 60,
  },
  welcomeText: {
    fontSize: 18,
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 28,
  },
  authButtons: {
    width: '100%',
    gap: 16,
  },
  authButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  exploreButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#718096',
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    marginRight: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  modalContent: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#E8B4CB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  linkText: {
    textAlign: 'center',
    color: '#E8B4CB',
    fontSize: 16,
  },
});

export default AuthScreen;