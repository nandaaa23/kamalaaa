import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const waveHeight = useSharedValue(height * 0.7);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate title appearance
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 1000 }));
    
    // Animate subtitle appearance
    subtitleOpacity.value = withDelay(1000, withTiming(1, { duration: 1000 }));
    
    // After 4 seconds, animate waves upward
    setTimeout(() => {
      waveHeight.value = withTiming(-height * 0.3, { duration: 1500 });
      setTimeout(onComplete, 1500);
    }, 4000);
  }, []);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: waveHeight.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
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
        
        <Animated.View style={[styles.waveContainer, waveStyle]}>
          <LinearGradient
            colors={[Colors.mistyRose, Colors.pinkLavender1]}
            style={styles.wave}
          />
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
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
  },
  wave: {
    flex: 1,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
});