import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';

const { width, height } = Dimensions.get('window');

interface Bubble {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

export const GuiltReleaseBubblesScreen: React.FC = () => {
  const [customGuilt, setCustomGuilt] = useState('');
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [affirmationText, setAffirmationText] = useState('');
  const [releasedCount, setReleasedCount] = useState(0);

  const affirmationOpacity = useSharedValue(0);
  const affirmationScale = useSharedValue(0.8);

  const predefinedGuilts = [
    "I should've done more",
    "I feel selfish",
    "I'm not a good mom",
    "I yelled today",
    "I can't do it all",
    "I'm not patient enough",
    "I should be happier",
    "I'm failing them",
  ];

  const bubbleColors = [Colors.mintCream, Colors.mistyRose, Colors.pinkLavender1, Colors.lightCyan];

  const generateBubbles = (): Bubble[] => {
    return predefinedGuilts.map((guilt, index) => ({
      id: index.toString(),
      text: guilt,
      x: Math.random() * (width - 120) + 60,
      y: Math.random() * (height * 0.6) + 200,
      size: Math.random() * 40 + 80,
      color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
    }));
  };

  const [bubbles, setBubbles] = useState<Bubble[]>(generateBubbles());

  const showAffirmationMessage = (isCustom: boolean) => {
    const message = isCustom 
      ? "That thought doesn't define your worth. You're doing your best."
      : "You're already doing enough.";
    
    setAffirmationText(message);
    setShowAffirmation(true);
    
    affirmationOpacity.value = withTiming(1, { duration: 500 });
    affirmationScale.value = withTiming(1, { duration: 500 });
    
    setTimeout(() => {
      affirmationOpacity.value = withTiming(0, { duration: 500 });
      affirmationScale.value = withTiming(0.8, { duration: 500 });
      setTimeout(() => setShowAffirmation(false), 500);
    }, 3000);
  };

  const handleBubbleTap = (bubbleId: string) => {
    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
    setReleasedCount(prev => prev + 1);
    showAffirmationMessage(false);
    
    if (releasedCount >= 1) {
      setTimeout(() => {
        setAffirmationText("Thank you for releasing what weighs on you. You are not alone in this.");
        setShowAffirmation(true);
        affirmationOpacity.value = withTiming(1, { duration: 500 });
        affirmationScale.value = withTiming(1, { duration: 500 });
      }, 4000);
    }
  };

  const handleCustomRelease = () => {
    if (!customGuilt.trim()) return;
    
    setCustomGuilt('');
    setReleasedCount(prev => prev + 1);
    showAffirmationMessage(true);
    
    if (releasedCount >= 1) {
      setTimeout(() => {
        setAffirmationText("Thank you for releasing what weighs on you. You are not alone in this.");
        setShowAffirmation(true);
        affirmationOpacity.value = withTiming(1, { duration: 500 });
        affirmationScale.value = withTiming(1, { duration: 500 });
      }, 4000);
    }
  };

  const affirmationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: affirmationOpacity.value,
    transform: [{ scale: affirmationScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>Guilt Release Bubbles</Text>
        <Text style={styles.subtitle}>
          Pop what you're carrying. Let a little go.
        </Text>
      </View>

      <View style={styles.bubblesContainer}>
        {bubbles.map((bubble) => (
          <TouchableOpacity
            key={bubble.id}
            style={[
              styles.bubble,
              {
                left: bubble.x,
                top: bubble.y,
                width: bubble.size,
                height: bubble.size,
                borderRadius: bubble.size / 2,
                backgroundColor: bubble.color,
              },
            ]}
            onPress={() => handleBubbleTap(bubble.id)}
          >
            <Text style={[styles.bubbleText, { fontSize: bubble.size > 100 ? 12 : 10 }]}>
              {bubble.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customSection}>
        <TextInput
          style={styles.customInput}
          placeholder="I feel guilty that..."
          placeholderTextColor={Colors.textSecondary}
          value={customGuilt}
          onChangeText={setCustomGuilt}
          multiline
        />
        <TouchableOpacity
          style={[styles.releaseButton, !customGuilt.trim() && styles.disabledButton]}
          onPress={handleCustomRelease}
          disabled={!customGuilt.trim()}
        >
          <Text style={styles.releaseButtonText}>Let it go</Text>
        </TouchableOpacity>
      </View>

      {showAffirmation && (
        <Animated.View style={[styles.affirmationOverlay, affirmationAnimatedStyle]}>
          <View style={styles.affirmationCard}>
            <Text style={styles.affirmationText}>{affirmationText}</Text>
          </View>
        </Animated.View>
      )}

      {bubbles.length === 0 && (
        <View style={styles.resetContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setBubbles(generateBubbles())}
          >
            <Text style={styles.resetButtonText}>More Bubbles</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.jet,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bubblesContainer: {
    flex: 1,
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleText: {
    color: Colors.jet,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  customSection: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  customInput: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  releaseButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  releaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
  affirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  affirmationCard: {
    backgroundColor: Colors.mintCream,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 40,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  affirmationText: {
    fontSize: 18,
    color: Colors.jet,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  resetContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
});