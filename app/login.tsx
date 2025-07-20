import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  React.useEffect(() => {
    console.log('🎉 LOGIN SCREEN MOUNTED SUCCESSFULLY');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LOGIN SCREEN</Text>
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
        style={styles.registerButton}
        onPress={() => {
          console.log('Going to register...');
          router.push('/register' as any);
        }}
      >
        <Text style={styles.registerButtonText}>Go to Register →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
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
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});