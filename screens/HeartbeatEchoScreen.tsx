import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useData } from '../contexts/DataContext';
import { BackButton } from '../components/BackButton';
import i18n from '../src/i18n/i18n';

const { width, height } = Dimensions.get('window');

const AFFIRMATIONS = [
  i18n.t('affirmation1'),
  i18n.t('affirmation2'),
  i18n.t('affirmation3'),
  i18n.t('affirmation4'),
  i18n.t('affirmation5'),
  i18n.t('affirmation6'),
];

export const HeartbeatEchoScreen: React.FC = () => {
  const [phase, setPhase] = useState<'baby' | 'mother' | 'visualization' | 'end'>('baby');
  const [tapCount, setTapCount] = useState(0);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [babyInterval, setBabyInterval] = useState(600);
  const [motherInterval, setMotherInterval] = useState(1000);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [showSessions, setShowSessions] = useState(false);
  
  const { addHeartbeatMoment, heartbeatMoments } = useData();
  
  const motherScale = useSharedValue(1);
  const babyScale = useSharedValue(1);
  const motherHaloOpacity = useSharedValue(0);
  const babyHaloOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(1);
  const affirmationOpacity = useSharedValue(0);
  
  const affirmationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'visualization') {
      startVisualization();
      startAffirmationCycle();
    }
    
    return () => {
      if (affirmationTimer.current) {
        clearInterval(affirmationTimer.current);
      }
    };
  }, [phase]);

  const handleTap = () => {
    const now = Date.now();
    const newTimestamps = [...tapTimestamps, now];
    setTapTimestamps(newTimestamps);
    setTapCount(tapCount + 1);

    const pulseValue = phase === 'baby' ? babyScale : motherScale;
    pulseValue.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );

    if (tapCount === 3) {
      const intervals = [];
      for (let i = 1; i < newTimestamps.length; i++) {
        intervals.push(newTimestamps[i] - newTimestamps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      if (phase === 'baby') {
        setBabyInterval(avgInterval);
        setTimeout(() => {
          setPhase('mother');
          setTapCount(0);
          setTapTimestamps([]);
        }, 1000);
      } else {
        setMotherInterval(avgInterval);
        setTimeout(() => {
          setPhase('visualization');
        }, 1000);
      }
    }
  };

  const startVisualization = () => {
    motherScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: motherInterval * 0.3, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: motherInterval * 0.7, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    babyScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: babyInterval * 0.3, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: babyInterval * 0.7, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    motherHaloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: motherInterval * 0.3 }),
        withTiming(0, { duration: motherInterval * 0.7 })
      ),
      -1
    );

    babyHaloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: babyInterval * 0.3 }),
        withTiming(0, { duration: babyInterval * 0.7 })
      ),
      -1
    );

    setTimeout(() => {
      setPhase('end');
    }, 30000);
  };

  const startAffirmationCycle = () => {
    affirmationOpacity.value = withTiming(1, { duration: 1000 });
    
    affirmationTimer.current = setInterval(() => {
      affirmationOpacity.value = withSequence(
        withTiming(0, { duration: 500 }),
        withDelay(200, withTiming(1, { duration: 500 }))
      );
      
      setTimeout(() => {
        setCurrentAffirmation((prev) => (prev + 1) % AFFIRMATIONS.length);
      }, 500);
    }, 5000);
  };

  const saveSession = async () => {
    const title = `${i18n.t('echoHeartbeatsTitle')} - ${new Date().toLocaleDateString('ml-IN')}`;
    await addHeartbeatMoment({
      date: new Date().toISOString(),
      babyHeartbeat: tapTimestamps, 
      motherHeartbeat: tapTimestamps,
      title,
    });
    
    contentOpacity.value = withSequence(
      withTiming(0.5, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
  };

  const motherOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: motherScale.value }],
  }));

  const babyOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: babyScale.value }],
  }));

  const motherHaloStyle = useAnimatedStyle(() => ({
    opacity: motherHaloOpacity.value,
    transform: [{ scale: interpolate(motherHaloOpacity.value, [0, 0.6], [1, 1.5]) }],
  }));

  const babyHaloStyle = useAnimatedStyle(() => ({
    opacity: babyHaloOpacity.value,
    transform: [{ scale: interpolate(babyHaloOpacity.value, [0, 0.7], [1, 1.4]) }],
  }));

  const affirmationStyle = useAnimatedStyle(() => ({
    opacity: affirmationOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (phase === 'visualization') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.visualizationContainer}>
            <Animated.View style={[styles.orbsContainer, contentStyle]}>
              {/* Mother's orb with halo */}
              <View style={styles.motherOrbContainer}>
                <Animated.View style={[styles.motherHalo, motherHaloStyle]} />
                <Animated.View style={[styles.motherOrb, motherOrbStyle]}>
                  <LinearGradient
                    colors={['#4ECDC4', '#44A08D']}
                    style={styles.orbGradient}
                  />
                </Animated.View>
              </View>

              {/* Baby's orb with halo - centered within mother's */}
              <View style={styles.babyOrbContainer}>
                <Animated.View style={[styles.babyHalo, babyHaloStyle]} />
                <Animated.View style={[styles.babyOrb, babyOrbStyle]}>
                  <LinearGradient
                    colors={['#FFB6C1', '#FF69B4']}
                    style={styles.orbGradient}
                  />
                </Animated.View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.affirmationContainer, affirmationStyle]}>
              <Text style={styles.affirmationText}>
                {AFFIRMATIONS[currentAffirmation]}
              </Text>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  if (phase === 'end') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.endContainer}>
            <Animated.View 
              entering={FadeIn.duration(1000)}
              style={styles.endContent}
            >
              <Text style={styles.endTitle}>{i18n.t('endTitle')}</Text>
             <Text style={styles.endSubtitle}>{i18n.t('endSubtitle')}</Text>

              <View style={styles.endActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveSession}
                >
                  <Text style={styles.saveIcon}>💾</Text>
                  <Text style={styles.saveButtonText}>{i18n.t('saveSession')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => setShowSessions(true)}
                >
                  <Text style={styles.viewIcon}>📖</Text>
                  <Text style={styles.viewButtonText}>{i18n.t('viewPastSessions')}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.newSessionButton}
                onPress={() => {
                  setPhase('baby');
                  setTapCount(0);
                  setTapTimestamps([]);
                }}
              >
               <Text style={styles.newSessionText}>{i18n.t('startNewSession')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>

        <Modal
          visible={showSessions}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <BlurView intensity={80} style={styles.modalBlur}>
              <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{i18n.t('pastSessionsTitle')}</Text>
                <ScrollView style={styles.sessionsList}>
                  {heartbeatMoments.map((moment) => (
                    <View key={moment.id} style={styles.sessionCard}>
                      <View style={styles.sessionPreview}>
                        <View style={styles.miniMotherOrb} />
                        <View style={styles.miniBabyOrb} />
                      </View>
                      <View style={styles.sessionInfo}>
                        <Text style={styles.sessionTitle}>{moment.title}</Text>
                        <Text style={styles.sessionDate}>
                          {new Date(moment.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowSessions(false)}
                >
                  <Text style={styles.closeButtonText}>{i18n.t('close')}</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2C3E50', '#3498DB', '#5DADE2']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.calibrationContainer}>
          <BackButton  />
          
          <Animated.View 
            entering={FadeIn.duration(800)}
            style={styles.calibrationContent}
          >
           <Text style={styles.calibrationTitle}>
             {phase === 'baby' ? i18n.t('babyRhythm') : i18n.t('yourRhythm')}
           </Text>

            
            <Text style={styles.calibrationInstructions}>
              {phase === 'baby' 
              ? i18n.t('calibrationBaby')
                : i18n.t('calibrationYou')
              }
             </Text>


            <Pressable
              style={styles.tapZone}
              onPress={handleTap}
            >
              <Animated.View style={phase === 'baby' ? babyOrbStyle : motherOrbStyle}>
                <LinearGradient
                  colors={phase === 'baby' ? ['#FFB6C1', '#FF69B4'] : ['#4ECDC4', '#44A08D']}
                  style={styles.tapCircle}
                >
                  <Text style={styles.tapCount}>{tapCount}/4</Text>
                </LinearGradient>
              </Animated.View>
              <Text style={styles.tapHint}>{i18n.t('tapHere')}</Text>
            </Pressable>

            <View style={styles.progressDots}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    i < tapCount && styles.progressDotActive
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  calibrationContainer: {
    flex: 1,
    padding: 20,
  },
  calibrationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calibrationTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  calibrationInstructions: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    marginHorizontal: 20,
    marginBottom: 50,
    opacity: 0.95,
  },
  tapZone: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  tapCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  tapCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tapHint: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 20,
    opacity: 0.7,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 15,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
  },
  visualizationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbsContainer: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  motherOrbContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motherOrb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  motherHalo: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#4ECDC4',
    opacity: 0.3,
  },
  babyOrbContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  babyOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 25,
  },
  babyHalo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFB6C1',
    opacity: 0.3,
  },
  orbGradient: {
    flex: 1,
  },
  affirmationContainer: {
    position: 'absolute',
    bottom: 100,
    paddingHorizontal: 40,
  },
  affirmationText: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  endContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  endContent: {
    alignItems: 'center',
  },
  endTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  endSubtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 50,
    opacity: 0.9,
  },
  endActions: {
    gap: 20,
    marginBottom: 40,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 12,
  },
  saveIcon: {
    fontSize: 24,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 12,
  },
  viewIcon: {
    fontSize: 24,
  },
  viewButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  newSessionButton: {
    marginTop: 20,
  },
  newSessionText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 20,
    textAlign: 'center',
  },
  sessionsList: {
    maxHeight: height * 0.5,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sessionPreview: {
    flexDirection: 'row',
    marginRight: 16,
  },
  miniMotherOrb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    marginRight: -10,
  },
  miniBabyOrb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFB6C1',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    marginTop: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});