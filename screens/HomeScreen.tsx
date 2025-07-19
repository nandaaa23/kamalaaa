import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Colors } from '../constants/Colors';
import { FeatureCard } from '../components/FeatureCard';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const features = [
    {
      title: 'Chat with Kamala',
      description: 'Your AI companion for support',
      icon: '💬',
      color: '#E8B4CB', // Kamala's signature color
      screen: '/chat',
      isLocked: false,
    },
    {
      title: 'Mood Log',
      description: 'Check in with your emotions daily',
      icon: '💭',
      color: Colors.lightCyan,
      screen: 'MoodLogScreen',
      isLocked: false,
    },
    {
      title: 'Reflections',
      description: 'A private space for your thoughts',
      icon: '📝',
      color: Colors.mistyRose,
      screen: 'ReflectionsScreen',
      isLocked: user?.isGuest,
    },
    {
      title: 'Secret Circle',
      description: 'Share anonymously with others',
      icon: '🌸',
      color: Colors.pinkLavender1,
      screen: 'SecretCircleScreen',
      isLocked: user?.isGuest,
    },
    {
      title: 'Breathe & Be',
      description: 'Gentle practices for calm',
      icon: '🫧',
      color: Colors.mintGreen,
      screen: 'BreatheAndBeScreen',
      isLocked: false,
    },
    {
      title: 'Learn & Heal',
      description: 'Resources for recovery',
      icon: '🌱',
      color: Colors.honeydew,
      screen: 'LearnAndHealScreen',
      isLocked: user?.isGuest,
    },
    {
      title: 'Listen-In',
      description: 'Podcasts and stories',
      icon: '🎧',
      color: Colors.linen,
      screen: 'ListenInScreen',
      isLocked: user?.isGuest,
    },
  ];

  const handleFeaturePress = (feature: any) => {
    if (feature.isLocked) {
      console.log('Show join prompt');
    } else {
      router.push(feature.screen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.profile?.displayName || 'friend'}.
          </Text>
          <Text style={styles.subGreeting}>How are you feeling today?</Text>
          <Text style={styles.description}>
            This space is yours to check in, rest, and reconnect.
          </Text>
        </View>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              isLocked={feature.isLocked}
              screen={feature.screen}
              onPress={() => handleFeaturePress(feature)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  features: {
    padding: 20,
    paddingTop: 0,
  },
});

export default HomeScreen;