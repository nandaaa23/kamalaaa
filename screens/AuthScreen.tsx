// ========================================
// screens/AuthScreen.tsx - Complete file
// ========================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Login Modal Component
const LoginModal = ({ visible, onClose, onRegister, onSuccess }: {
  visible: boolean;
  onClose: () => void;
  onRegister: () => void;
  onSuccess: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate login for now (replace with real Firebase auth later)
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success!', 'Login successful!', [
        { text: 'OK', onPress: () => {
          onClose();
          onSuccess();
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
          <Text style={styles.modalTitle}>Login</Text>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
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
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onRegister} disabled={isLoading}>
            <Text style={styles.linkText}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Register Modal Component
const RegisterModal = ({ visible, onClose, onLogin }: {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    // Simulate registration (replace with real Firebase auth later)
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success!', 'Account created successfully! Please login with your credentials.', [
        {
          text: 'OK',
          onPress: () => {
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
          <Text style={styles.modalTitle}>Create Account</Text>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
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
              {isLoading ? 'Creating Account...' : 'Register'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogin} disabled={isLoading}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Main AuthScreen Component
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
    
    // Set guest user in storage
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
    
    // Call onComplete to trigger navigation
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

  const handleAuthSuccess = async () => {
    console.log('🎉 Authentication successful');
    
    // Create authenticated user
    const selectedRole = await AsyncStorage.getItem('selected_role');
    const authUser: User = {
      id: 'auth_user_' + Date.now(),
      name: 'Authenticated User',
      email: 'user@example.com',
      role: (selectedRole as 'mother' | 'psychologist') || 'mother',
      isGuest: false,
      onboardingComplete: selectedRole === 'psychologist', // Psychologists skip onboarding
      profile: selectedRole === 'psychologist' ? {} : undefined,
      createdAt: new Date().toISOString()
    };
    
    console.log('👤 Created user object:', authUser);
    await AsyncStorage.setItem('user', JSON.stringify(authUser));
    console.log('💾 User saved to AsyncStorage');
    
    // Close modals
    setShowLogin(false);
    setShowRegister(false);
    
    // Call onComplete to trigger navigation
    if (onComplete) {
      onComplete(authUser);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Kamala.</Text>
        <Text style={styles.tagline}>For mothers, postpartum.</Text>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome to your safe space for healing, connection, and gentle support.
          </Text>
        </View>

        <View style={styles.authButtons}>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: '#E8B4CB' }]}
            onPress={handleLogin}
          >
            <Text style={styles.authButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: '#E8B4CB' }]}
            onPress={handleRegister}
          >
            <Text style={styles.authButtonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreButton}
            onPress={handleExplore}
          >
            <Text style={styles.exploreButtonText}>Explore Kamala</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Modal */}
      <LoginModal 
        visible={showLogin} 
        onClose={() => setShowLogin(false)}
        onRegister={switchToRegister}
        onSuccess={handleAuthSuccess}
      />

      {/* Register Modal */}
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
  // Modal styles
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