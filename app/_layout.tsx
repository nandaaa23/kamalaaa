import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SplashScreen } from '@/components/SplashScreen';
import { IntroductionScreens } from '@/components/IntroductionScreens';
import { AuthScreen } from '@/screens/AuthScreen';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, isLoading, updateProfile, completeOnboarding } = useAuth();

  useFrameworkReady();

  useEffect(() => {
    if (!isLoading && !showSplash && !showIntro) {
      if (!user) {
        setShowAuth(true);
      } else if (!user.isGuest && !user.onboardingComplete) {
        setShowOnboarding(true);
      } else {
        setShowAuth(false);
        setShowOnboarding(false);
      }
    }
  }, [user, isLoading, showSplash, showIntro]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setShowIntro(true);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleAuthComplete = () => {
    setShowAuth(false);
  };

  const handleOnboardingComplete = async (profile: any) => {
    await updateProfile(profile);
    await completeOnboarding();
    setShowOnboarding(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (showIntro) {
    return <IntroductionScreens onComplete={handleIntroComplete} />;
  }

  if (showAuth) {
    return <AuthScreen onComplete={handleAuthComplete} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
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