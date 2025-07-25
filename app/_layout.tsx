import { useEffect, useState, useRef } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SplashScreen } from '@/components/SplashScreen';
import { IntroductionScreens } from '@/components/IntroductionScreens';
import { RoleSelectorScreen } from '@/screens/RoleSelectorScreen';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { OnboardingpsychoScreen } from '@/components/OnboardingpyschoScreen';
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
  const [forceReinit, setForceReinit] = useState(0);
  const initRef = useRef(false);
  const hasInitiallyNavigated = useRef(false);
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useFrameworkReady();

  useEffect(() => {
    initRef.current = false;
    hasInitiallyNavigated.current = false;

    const initApp = async () => {
      try {
        console.log('🔍 Initializing app...');

          await AsyncStorage.clear(); // clear only once


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

        if (userData) {
          const user: User = JSON.parse(userData);
          setCurrentUser(user);
          
          if (!user.isGuest && !user.onboardingComplete) {
          console.log(`📝 ${user.role} needs onboarding`);
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

    setAppState('splash');
    setTimeout(initApp, 1500);
  }, [forceReinit]);

  useEffect(() => {
    if (!isReady || !currentUser || !navigationState?.key || hasInitiallyNavigated.current) return;

    const currentPath = segments.join('/');
    console.log('🚀 Initial navigation check, segments:', segments, 'path:', currentPath);

    hasInitiallyNavigated.current = true;

    if (currentPath === '') {
      if (currentUser.role === 'psychologist') {
        console.log('👩‍⚕ Initial navigation: psychologist to messages');
        router.replace('/(tabsp)/messages');
      } else if (currentUser.role === 'mother') {
        console.log('👩‍👧‍👦 Initial navigation: mother to dashboard');
        router.replace('/(tabs)');
      }
    }
  }, [isReady, currentUser, navigationState?.key]);

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

  if (!authenticatedUser.isGuest && !authenticatedUser.onboardingComplete) {
    if (authenticatedUser.role === 'mother' || authenticatedUser.role === 'psychologist') {
      setAppState('onboarding');
    } else {
      setAppState('ready');
      setIsReady(true);
  }
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
    profile: profileData || {},
  };

  setCurrentUser(updatedUser);
  await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

  setAppState('ready');
  setIsReady(true);
};


  useEffect(() => {
    const checkAuthStatus = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (!userData && appState === 'ready') {
        console.log('🚪 User logged out, resetting app...');
        setAppState('loading');
        setCurrentUser(null);
        setIsReady(false);
        hasInitiallyNavigated.current = false;
        setForceReinit(prev => prev + 1); 
      }
    };

    const interval = setInterval(checkAuthStatus, 1000);
    
    return () => clearInterval(interval);
  }, [appState]);

  console.log('🎬 App state:', {
    appState,
    isReady,
    user: currentUser?.name || 'none',
    role: currentUser?.role || 'none',
    segments: segments.join('/'),
    hasInitiallyNavigated: hasInitiallyNavigated.current
  });

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
  if (!currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading user profile...</Text>
      </View>
    );
  }

  if (currentUser.role === 'psychologist') {
    return <OnboardingpsychoScreen onComplete={handleOnboardingComplete} />;
  }

  return <OnboardingScreen onComplete={handleOnboardingComplete} />;
}


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