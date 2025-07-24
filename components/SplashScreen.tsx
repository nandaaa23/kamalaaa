import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeOut,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import WaveImage from '../assets/images/wave.png';
import i18n from '../src/i18n/i18n';

const { height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const waveTranslateY = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
      titleOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
      subtitleOpacity.value = withDelay(
      500,
      withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      })
    );

    setTimeout(() => {
      waveTranslateY.value = withTiming(height + height / 3, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      });
    }, 3200);

    // Wave rises after 3.2 seconds
    setTimeout(() => {
      waveTranslateY.value = withTiming(height + height / 3, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      });
    }, 3200);

    // Fade out entire screen after 4.2s, then call onComplete
    setTimeout(() => {
      containerOpacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.ease,
      }, (finished) => {
        if (finished) {
          runOnJS(onComplete)(); 
        }
      });
    }, 4200);

  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: waveTranslateY.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={[Colors.floralWhite, Colors.lightCyan]}
        style={styles.background}
      >
        <View style={styles.content}>
          <Animated.Text style={[styles.title, titleStyle]}>
            {i18n.t('welcome')}
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            {i18n.t('subtitle')}
          </Animated.Text>
        </View>

        <Animated.View style={[styles.waveWrapper, waveStyle]}>
          <Image source={WaveImage} style={styles.waveImage} resizeMode="cover" />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
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
    paddingHorizontal: 40,
    zIndex: 2,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.jet,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  waveWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height / 3,
    zIndex: 1,
  },
  waveImage: {
    width: '100%',
    height: '100%',
  },
});
