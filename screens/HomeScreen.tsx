import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { FeatureCard } from '../components/FeatureCard';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import i18n from '../app/src/i18n/i18n';


const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return i18n.t('morning');
    if (hour < 17) return i18n.t('afternoon');
    return i18n.t('evening');
  };

  const features = [
    {
      title:i18n.t('chatwk'),
      description:i18n.t('chatdesc'),
      icon: '💬',
      color: '#E8B4CB',
      screen: '/chat', 
      isLocked: false,
    },
    {
      title: i18n.t('mood'),
      description:i18n.t('mooddesc'),
      icon: '💭',
      color: Colors.lightCyan,
      screen: '/MoodLogScreen',
      isLocked: false,
    },
    {
      title: i18n.t('refl'),
      description:  i18n.t('refl'),
      icon: '📝',
      color: Colors.mistyRose,
      screen: '/ReflectionsScreen', 
      isLocked: user?.isGuest,
    },
    {
      title:  i18n.t('sc'),
      description:i18n.t('sc'),
      icon: '🌸',
      color: Colors.pinkLavender1,
      screen: '/SecretCircleScreen', 
      isLocked: user?.isGuest,
    },
    {
      title:i18n.t('bab'),
      description:i18n.t('babdesc'),
      icon: '🫧',
      color: Colors.mintGreen,
      screen: '/BreatheAndBeScreen', 
      isLocked: false,
    },
    {
      title:i18n.t('lnh'),
      description: 'lnhdesc',
      icon: '🌱',
      color: Colors.honeydew,
      screen: '/LearnAndHealScreen', 
      isLocked: user?.isGuest,
    },
    {
      title:i18n.t('pod'),
      description: i18n.t('poddesc'),
      icon: '🎧',
      color: Colors.linen,
      screen: '/ListenInScreen', 
      isLocked: user?.isGuest,
    },
  ];
  console.log('Current Language:', i18n.locale);
  console.log('Translated Title:', i18n.t('homeTitle'));
  
  const handleFeaturePress = (feature: any) => {
    console.log('🎯 Feature pressed:', feature.title, feature.screen);
    
    if (feature.isLocked) {
      Alert.alert(
        i18n.t('pod'),
        i18n.t('poddec'),
 
        [
          {
            text:  i18n.t('NotNow'),
            style: 'cancel',
          },
          {
            text:i18n.t('signup'),
            onPress: () => {
              router.push('/auth');
              console.log('Navigate to signup');
            },
          },
        ],
      );
      return;
    }

  
    try {
      console.log('🚀 Attempting navigation to:', feature.screen);
      
      
      const screens = [
        '/chat',
        '/MoodLogScreen', 
        '/ReflectionsScreen',
        '/SecretCircleScreen',
        '/BreatheAndBeScreen',
        '/LearnAndHealScreen',
        '/ListenInScreen'
      ];
      
      if (screens.includes(feature.screen)) {
        router.push(feature.screen);
        console.log('✅ Navigation executed');
      } else {
        console.error('❌ Screen not found:', feature.screen);
        Alert.alert(i18n.t('comingsoon'), `${feature.title}, ${i18n.t('soon')}`);
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert(
        i18n.t('navigationErrorTitle'),
        i18n.t('navigationErrorMessage', {
          title: feature.title,
          error: (error as Error)?.message || i18n.t('unknownError')
        })
      );
    }
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.profile?.displayName || user?.name || 'friend'}.
          </Text>
          <Text style={styles.subGreeting}>{i18n.t('hft')}</Text>
          <Text style={styles.description}>
          {i18n.t('subt')}
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
    backgroundColor: Colors.background || '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.jet || '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subGreeting: {
    fontSize: 18,
    color: Colors.textSecondary || '#666666',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary || '#666666',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  features: {
    padding: 20,
    paddingTop: 10,
  },
});

export default HomeScreen;