// Fixed app/_layout.tsx - Robust navigation with proper routing
import { useEffect, useState, useCallback, useRef } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SplashScreen } from '@/components/SplashScreen';
import { IntroductionScreens } from '@/components/IntroductionScreens';
import { RoleSelectorScreen } from '@/screens/RoleSelectorScreen';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import AuthScreen from '@/screens/AuthScreen';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

type AppState = 'loading' | 'splash' | 'intro' | 'role' | 'auth' | 'onboarding' | 'ready';

function AppContent() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useFrameworkReady();

  // Initialize app
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initApp = async () => {
      try {
        console.log('🔍 Initializing app...');

        // For testing - uncomment to reset
        await AsyncStorage.clear();

        const [userData, introDone, role] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('intro_complete'),
          AsyncStorage.getItem('selected_role')
        ]);

        console.log('📊 Storage state:', {
          hasUser: !!userData,
          introDone: !!introDone,
          role
        });

        // Determine initial state
        if (userData) {
          const user: User = JSON.parse(userData);
          setCurrentUser(user);
          
          if (user.role === 'mother' && !user.isGuest && !user.onboardingComplete) {
            console.log('📝 Mother needs onboarding');
            setAppState('onboarding');
          } else {
            console.log('✅ User ready for app');
            setAppState('ready');
            setIsReady(true);
          }
        } else if (!introDone) {
          setAppState('intro');
        } else if (!role) {
          setAppState('role');
        } else {
          setAppState('auth');
        }
      } catch (error) {
        console.error('❌ Init error:', error);
        setAppState('intro');
      }
    };

    // Show splash first
    setAppState('splash');
    setTimeout(initApp, 1500);
  }, []);

  // Handle navigation when ready
  useEffect(() => {
    if (!isReady || !currentUser || !navigationState?.key) return;

    console.log('🚀 Navigation state ready, current segments:', segments);

    // Only redirect if we're at the root or in an invalid state
    const currentPath = segments.join('/');
    const isInMotherTabs = currentPath.includes('(tabs)');
    const isInPsychTabs = currentPath.includes('(tabsp)');
    
    // Check if we're in any valid route
    const validRoutes = [
      'chat',
      'MoodLogScreen',
      'ReflectionsScreen',
      'SecretCircleScreen',
      'BreatheAndBeScreen',
      'LearnAndHealScreen',
      'ListenInScreen'
    ];
    
    const isInValidRoute = isInMotherTabs || 
                          isInPsychTabs || 
                          validRoutes.some(route => currentPath.includes(route));

    // Only navigate if we're not already in a valid route
    if (!isInValidRoute && currentPath !== '') {
      if (currentUser.role === 'psychologist') {
        console.log('👩‍⚕️ Navigating psychologist to messages');
        router.replace('/(tabsp)/messages');
      } else if (currentUser.role === 'mother') {
        console.log('👩‍👧‍👦 Navigating mother to dashboard');
        router.replace('/(tabs)');
      }
    }
  }, [isReady, currentUser, segments, navigationState, router]);

  const handleSplashComplete = () => {
    console.log('💫 Splash completed');
  };

  const handleIntroComplete = async () => {
    console.log('📋 Intro completed');
    await AsyncStorage.setItem('intro_complete', 'true');
    setAppState('role');
  };

  const handleRoleSelected = async (role: 'mother' | 'psychologist') => {
    console.log('🎭 Role selected:', role);
    await AsyncStorage.setItem('selected_role', role);
    setAppState('auth');
  };

  const handleAuthComplete = async (authenticatedUser?: User) => {
    console.log('🔐 Auth completed:', authenticatedUser);
    
    if (!authenticatedUser) return;

    setCurrentUser(authenticatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(authenticatedUser));
    
    if (authenticatedUser.role === 'mother' && 
        !authenticatedUser.isGuest && 
        !authenticatedUser.onboardingComplete) {
      setAppState('onboarding');
    } else {
      setAppState('ready');
      setIsReady(true);
    }
  };

  const handleOnboardingComplete = async (profileData?: any) => {
    console.log('📝 Onboarding completed');
    
    const user = currentUser || await AsyncStorage.getItem('user').then(u => u ? JSON.parse(u) : null);
    
    if (!user) {
      console.error('❌ No user found during onboarding completion');
      setAppState('auth');
      return;
    }

    const updatedUser: User = {
      ...user,
      onboardingComplete: true,
      profile: profileData || {}
    };
    
    setCurrentUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    
    setAppState('ready');
    setIsReady(true);
  };

  console.log('🎬 App state:', {
    appState,
    isReady,
    user: currentUser?.name || 'none',
    role: currentUser?.role || 'none',
    segments: segments.join('/')
  });

  // Render based on state
  if (appState === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (appState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (appState === 'intro') {
    return <IntroductionScreens onComplete={handleIntroComplete} />;
  }

  if (appState === 'role') {
    return <RoleSelectorScreen onSelectRole={handleRoleSelected} />;
  }

  if (appState === 'auth') {
    return <AuthScreen onComplete={handleAuthComplete} />;
  }

  if (appState === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Main app navigation
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            animation: 'none'
          }} 
        />
        <Stack.Screen 
          name="(tabsp)" 
          options={{ 
            animation: 'none'
          }} 
        />
        <Stack.Screen 
          name="chat" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom' 
          }} 
        />
        <Stack.Screen name="MoodLogScreen" />
        <Stack.Screen name="ReflectionsScreen" />
        <Stack.Screen name="SecretCircleScreen" />
        <Stack.Screen name="BreatheAndBeScreen" />
        <Stack.Screen name="LearnAndHealScreen" />
        <Stack.Screen name="ListenInScreen" />
        <Stack.Screen name="HeartbeatEchoScreen" />
        <Stack.Screen name="MindShiftScreen" />
        <Stack.Screen name="GuiltReleaseBubblesScreen" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}