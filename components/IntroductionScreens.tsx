import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import i18n from '../src/i18n/i18n';

const { width } = Dimensions.get('window');

interface IntroductionScreensProps {
  onComplete: () => void;
}

export const IntroductionScreens: React.FC<IntroductionScreensProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideProgress = useSharedValue(0);

  const slides = [
    {
      text:i18n.t('intro1'),
      background: Colors.mistyRose,
      numberOfLines: 5,
    },
    {
      text:i18n.t('intro2'),
      background: Colors.lightCyan,
      numberOfLines: 5,
    },
    {
      text:i18n.t('intro3'),
      background: Colors.mintGreen,
      numberOfLines: 5,
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      slideProgress.value = withTiming(nextSlide);
    } else {
      onComplete();
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            slideProgress.value,
            [0, 1, 2],
            [0, -width, -width * 2]
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.floralWhite, Colors.honeydew]}
        style={styles.background}
      >
        <View style={styles.content}>
          <Text style={styles.logo}> {i18n.t('welcome')}</Text>

          <View style={styles.slidesContainer}>
            <Animated.View style={[styles.slides, animatedStyle]}>
              {slides.map((slide, index) => (
                <View key={index} style={[styles.slide]}>
                  <Text style={styles.slideText}>{slide.text}</Text>
                </View>
              ))}
            </Animated.View>
          </View>

          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentSlide === index && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? i18n.t('button1') : i18n.t('button2')}
            </Text>
          </TouchableOpacity>
        </View>
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
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.jet,
    marginBottom: 60,
  },
  slidesContainer: {
    height: 280,
    width: width,
    overflow: 'hidden',
    marginBottom: 40,
  },
  slides: {
    flexDirection: 'row',
    width: width * 3,
  },
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideText: {
    fontSize: 14,
    color: Colors.jet,
    textAlign: 'center',
    lineHeight: 28,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
  },
  nextButton: {
    backgroundColor: '#E8B4CB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});