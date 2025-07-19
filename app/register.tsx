// Step 3: Create fresh app/register.tsx (copy this exactly)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  React.useEffect(() => {
    console.log('🎉 REGISTER SCREEN MOUNTED SUCCESSFULLY');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>REGISTER SCREEN</Text>
      <Text style={styles.subtitle}>Navigation worked! 🎉</Text>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          console.log('Going back...');
          router.back();
        }}
      >
        <Text style={styles.backButtonText}>← Go Back</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.loginButton}
        onPress={() => {
          console.log('Going to login...');
          router.push('/login' as any);
        }}
      >
        <Text style={styles.loginButtonText}>Go to Login →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4ecdc4',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#4ecdc4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});