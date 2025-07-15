import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import { useData } from '../contexts/DataContext';

const { width, height } = Dimensions.get('window');

export const HeartbeatEchoScreen: React.FC = () => {
  const [phase, setPhase] = useState<'baby' | 'mother' | 'preview' | 'moments'>('baby');
  const [babyHeartbeat, setBabyHeartbeat] = useState<number[]>([]);
  const [motherHeartbeat, setMotherHeartbeat] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const { addHeartbeatMoment, heartbeatMoments } = useData();

  const babyPulse = useSharedValue(1);
  const motherPulse = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const recordingRef = useRef<NodeJS.Timeout>();

  const startRecording = () => {
    setIsRecording(true);
    setTimeLeft(10);
    
    const currentHeartbeat = phase === 'baby' ? babyHeartbeat : motherHeartbeat;
    const setHeartbeat = phase === 'baby' ? setBabyHeartbeat : setMotherHeartbeat;
    
    // Clear previous recording
    setHeartbeat([]);
    
    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (phase === 'baby') {
      setPhase('mother');
    } else {
      setPhase('preview');
      startPreview();
    }
  };

  const handleTap = () => {
    if (!isRecording) return;
    
    const timestamp = Date.now();
    const currentHeartbeat = phase === 'baby' ? babyHeartbeat : motherHeartbeat;
    const setHeartbeat = phase === 'baby' ? setBabyHeartbeat : setMotherHeartbeat;
    
    setHeartbeat([...currentHeartbeat, timestamp]);
    
    // Trigger ripple animation
    rippleScale.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 300 })
    );
  };

  const startPreview = () => {
    // Calculate intervals for animation
    const babyIntervals = babyHeartbeat.length > 1 
      ? babyHeartbeat.slice(1).map((beat, i) => beat - babyHeartbeat[i])
      : [800]; // Default interval
    
    const motherIntervals = motherHeartbeat.length > 1
      ? motherHeartbeat.slice(1).map((beat, i) => beat - motherHeartbeat[i])
      : [1000]; // Default interval

    const avgBabyInterval = babyIntervals.reduce((a, b) => a + b, 0) / babyIntervals.length;
    const avgMotherInterval = motherIntervals.reduce((a, b) => a + b, 0) / motherIntervals.length;

    // Start pulsing animations
    babyPulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: avgBabyInterval / 2 }),
        withTiming(1, { duration: avgBabyInterval / 2 })
      ),
      -1
    );

    motherPulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: avgMotherInterval / 2 }),
        withTiming(1, { duration: avgMotherInterval / 2 })
      ),
      -1
    );
  };

  const saveHeartbeatMoment = async () => {
    const title = `Heartbeat Echo - ${new Date().toLocaleDateString()}`;
    await addHeartbeatMoment({
      date: new Date().toISOString().split('T')[0],
      babyHeartbeat,
      motherHeartbeat,
      title,
    });
    
    Alert.alert('Saved', 'Your echo is saved to My Moments.');
  };

  const babyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: babyPulse.value }],
  }));

  const motherAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: motherPulse.value }],
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: interpolate(rippleScale.value, [0, 1], [0.8, 0]),
  }));

  if (phase === 'moments') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setPhase('preview')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Moments</Text>
        </View>

        <View style={styles.momentsContainer}>
          {heartbeatMoments.length === 0 ? (
            <Text style={styles.emptyText}>
              No heartbeat moments saved yet. Create your first echo!
            </Text>
          ) : (
            heartbeatMoments.map((moment) => (
              <TouchableOpacity key={moment.id} style={styles.momentCard}>
                <View style={styles.momentPreview}>
                  <View style={styles.miniOrb} />
                  <View style={[styles.miniOrb, styles.motherOrb]} />
                </View>
                <View style={styles.momentInfo}>
                  <Text style={styles.momentTitle}>{moment.title}</Text>
                  <Text style={styles.momentDate}>{moment.date}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'preview') {
    return (
      <SafeAreaView style={[styles.container, styles.previewContainer]}>
        <BackButton />
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Your Heartbeat Echo</Text>
          <Text style={styles.previewSubtitle}>
            Together in every heartbeat — your bond shines.
          </Text>
        </View>

        <View style={styles.orbContainer}>
          <Animated.View style={[styles.babyOrb, babyAnimatedStyle]}>
            <Text style={styles.orbLabel}>Baby</Text>
          </Animated.View>
          
          <Animated.View style={[styles.motherOrb, motherAnimatedStyle]}>
            <Text style={styles.orbLabel}>You</Text>
          </Animated.View>
        </View>

        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmation}>
            You're doing beautifully — both of you.
          </Text>
        </View>

        <View style={styles.previewActions}>
          <TouchableOpacity
            style={styles.momentsButton}
            onPress={() => setPhase('moments')}
          >
            <Text style={styles.momentsButtonText}>View My Moments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveHeartbeatMoment}
          >
            <Text style={styles.saveButtonText}>Save This Echo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>Echo Our Heartbeats</Text>
        <Text style={styles.subtitle}>
          Feel your rhythm. Feel your bond.
        </Text>
      </View>

      <View style={styles.phaseIndicator}>
        <Text style={styles.phaseText}>
          {phase === 'baby' ? "Step 1: Baby's Rhythm" : "Step 2: Your Rhythm"}
        </Text>
        <Text style={styles.phaseDescription}>
          {phase === 'baby' 
            ? "Tap to mimic your baby's heartbeat" 
            : "Tap to match your own heartbeat"
          }
        </Text>
      </View>

      <View style={styles.recordingArea}>
        <TouchableOpacity
          style={[
            styles.tapArea,
            { backgroundColor: phase === 'baby' ? Colors.mistyRose : Colors.lightCyan }
          ]}
          onPress={handleTap}
          disabled={!isRecording}
        >
          <Animated.View style={[styles.ripple, rippleAnimatedStyle]} />
          <Text style={styles.tapInstruction}>
            {isRecording ? 'TAP TO RHYTHM' : 'GET READY'}
          </Text>
          {isRecording && (
            <Text style={styles.timer}>{timeLeft}s</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startRecording}
          >
            <Text style={styles.startButtonText}>
              {phase === 'baby' ? 'Start Recording Baby' : 'Start Recording You'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopRecording}
          >
            <Text style={styles.stopButtonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.microcopy}>
        Every beat tells a story.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  previewContainer: {
    backgroundColor: Colors.mintCream,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.jet,
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
  phaseIndicator: {
    padding: 20,
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 8,
  },
  phaseDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  recordingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  tapArea: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ripple: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: Colors.primary,
  },
  tapInstruction: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 8,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.jet,
  },
  controls: {
    padding: 20,
  },
  startButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.surface,
  },
  microcopy: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingBottom: 20,
  },
  previewHeader: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.jet,
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  orbContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  babyOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.mistyRose,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  motherOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.lightCyan,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  orbLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
  affirmationContainer: {
    padding: 20,
    alignItems: 'center',
  },
  affirmation: {
    fontSize: 18,
    color: Colors.jet,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  previewActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  momentsButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  momentsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
  momentsContainer: {
    flex: 1,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 100,
  },
  momentCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  momentPreview: {
    flexDirection: 'row',
    marginRight: 16,
  },
  miniOrb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.mistyRose,
    marginRight: 8,
  },
  momentInfo: {
    flex: 1,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 4,
  },
  momentDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});