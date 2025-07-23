import React, { useEffect } from 'react';
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.floralWhite, Colors.lightCyan]}
        style={styles.background}
      >
        <View style={styles.content}>
          <Animated.Text style={[styles.title, titleStyle]}>
            Kamala.
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            For mothers, postpartum.
          </Animated.Text>
        </View>

        <Animated.View style={[styles.waveWrapper, waveStyle]}>
          <Image source={WaveImage} style={styles.waveImage} resizeMode="cover" />
        </Animated.View>
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
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.jet,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  waveWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height / 3, 
    zIndex: 10,
  },
  waveImage: {
    width: '100%',
    height: '100%',
  },
});