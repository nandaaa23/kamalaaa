import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Dimensions, LayoutChangeEvent, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import i18n from '../src/i18n/i18n';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

interface Bubble {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

export const GuiltReleaseBubblesScreen: React.FC = () => {
  const [customThought, setCustomThought] = useState('');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [affirmationText, setAffirmationText] = useState('');
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [containerLayout, setContainerLayout] = useState<{width: number; height: number}>({ width: windowWidth, height: windowHeight * 0.5 });

  const affirmationOpacity = useSharedValue(0);
  const affirmationScale = useSharedValue(0.8);

  const releaseMessages = [
    i18n.t('thoughtRelease.release1'),
    i18n.t('thoughtRelease.release2'),
    i18n.t('thoughtRelease.release3'),
    i18n.t('thoughtRelease.release4'),
  ];
  
  const finalMessages = [
    i18n.t('thoughtRelease.final1'),
    i18n.t('thoughtRelease.final2'),
    i18n.t('thoughtRelease.final3'),
  ];
  

  const bubbleColors = [
    Colors.mintCream,
    Colors.mistyRose,
    Colors.pinkLavender1,
    Colors.lightCyan,
    '#F0F8FF',
    '#FFF5EE',
  ];

  const randomPosition = () => {
    const x = Math.random() * Math.max(containerLayout.width - 140, 0);
    const y = Math.random() * Math.max(containerLayout.height - 140, 0);
    return { x, y };
  };

  const handleAddThought = () => {
    const text = customThought.trim();
    if (!text) return;
    const { x, y } = randomPosition();
    const size = 90 + Math.random() * 40;
    const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
    const newBubble: Bubble = { id: `bubble-${Date.now()}`, text, x, y, size, color };

    setBubbles(prev => [...prev, newBubble]);
    setCustomThought('');
  };

  const showAffirmationMessage = (message: string) => {
    setAffirmationText(message);
    setShowAffirmation(true);
    affirmationOpacity.value = withTiming(1, { duration: 500 });
    affirmationScale.value = withTiming(1, { duration: 500 });

    setTimeout(() => {
      affirmationOpacity.value = withTiming(0, { duration: 500 });
      affirmationScale.value = withTiming(0.8, { duration: 500 });
      setTimeout(() => setShowAffirmation(false), 500);
    }, 2000);
  };

  const handleBubbleTap = (id: string) => {
    setBubbles(prev => {
      const filtered = prev.filter(b => b.id !== id);
      if (filtered.length === 0) {
        const msg = finalMessages[Math.floor(Math.random() * finalMessages.length)];
        showAffirmationMessage(msg);
      } else {
        const msg = releaseMessages[Math.floor(Math.random() * releaseMessages.length)];
        showAffirmationMessage(msg);
      }
      return filtered;
    });
  };

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerLayout({ width, height });
  };

  const affirmationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: affirmationOpacity.value,
    transform: [{ scale: affirmationScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header} onLayout={handleContainerLayout}>
        <Text style={styles.title}>{i18n.t('thoughtRelease.title')}</Text>
         <Text style={styles.subtitle}>{i18n.t('thoughtRelease.subtitle')}</Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.thoughtInput}
            placeholder={i18n.t('thoughtRelease.placeholder')}
            placeholderTextColor={Colors.textSecondary}
            value={customThought}
            onChangeText={setCustomThought}
            multiline
            maxLength={120}
          />
          <TouchableOpacity
            style={[styles.addButton, !customThought.trim() && styles.addButtonDisabled]}
            onPress={handleAddThought}
            disabled={!customThought.trim()}
          >
            <Text style={styles.addButtonText}>{i18n.t('thoughtRelease.addB')}</Text>

          </TouchableOpacity>
        </View>

        <View style={styles.bubblesContainer}>
          {bubbles.map(bubble => (
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
                }
              ]}
              onPress={() => handleBubbleTap(bubble.id)}
            >
              <Text style={[styles.bubbleText, { fontSize: bubble.size > 110 ? 12 : 11 }]}>                
                {bubble.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {showAffirmation && (
        <Animated.View style={[styles.affirmationOverlay, affirmationAnimatedStyle]}>
          <View style={styles.affirmationCard}>
            <Text style={styles.affirmationText}>{affirmationText}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 80, paddingBottom: 16, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: Colors.jet },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 8 },
  inputSection: { padding: 20, backgroundColor: 'rgba(255,255,255,0.9)', marginHorizontal: 16, borderRadius: 16 },
  thoughtInput: { height: 80, borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16, color: Colors.text, backgroundColor: Colors.floralWhite },
  addButton: { marginTop: 12, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  addButtonDisabled: { backgroundColor: 'rgba(0,0,0,0.1)' },
  addButtonText: { fontSize: 16, fontWeight: '600', color: Colors.jet },
  bubblesContainer: { flex: 1, margin: 20, position: 'relative' },
  bubble: { position: 'absolute', justifyContent: 'center', alignItems: 'center', padding: 8, shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  bubbleText: { color: Colors.jet, textAlign: 'center' },
  affirmationOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  affirmationCard: { backgroundColor: Colors.floralWhite, padding: 24, borderRadius: 16, maxWidth: '80%' },
  affirmationText: { fontSize: 18, fontWeight: '600', color: Colors.jet, textAlign: 'center' },
});
