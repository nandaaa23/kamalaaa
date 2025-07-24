import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
}

const GuestGuard: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  if (user?.isGuest) {
    return (
      <View style={styles.lockedScreen}>
        <Text style={styles.lockTitle}>🔒 Join Kamala to Access This Feature</Text>
        <Text style={styles.lockDescription}>
          This content is available for registered users only.
        </Text>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.joinButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  lockedScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: '#88b9edff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GuestGuard;
