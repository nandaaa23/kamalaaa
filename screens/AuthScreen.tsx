import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';

interface AuthScreenProps {
  onComplete: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onComplete }) => {
  const { signInWithGoogle, enterGuestMode } = useAuth();

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    onComplete();
  };

  const handleExplore = () => {
    enterGuestMode();
    onComplete();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.floralWhite, Colors.honeydew]}
        style={styles.background}
      >
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
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={handleExplore}
            >
              <Text style={styles.exploreButtonText}>Explore Kamala</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
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
    color: Colors.jet,
    marginBottom: 60,
  },
  tagline: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 40,
  },
  welcomeSection: {
    marginBottom: 60,
  },
  welcomeText: {
    fontSize: 18,
    color: Colors.jet,
    textAlign: 'center',
    lineHeight: 28,
  },
  authButtons: {
    width: '100%',
    gap: 16,
  },
  googleButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
  exploreButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});