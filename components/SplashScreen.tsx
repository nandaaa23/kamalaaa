import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
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

  useEffect(() => {
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    subtitleOpacity.value = withDelay(1200, withTiming(1, { duration: 800 }));

    setTimeout(() => {
      waveTranslateY.value = withTiming(height + height / 3, { duration: 1500 });
      setTimeout(onComplete, 1600);
    }, 4000);
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