// components/FeatureCard.tsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  isLocked?: boolean;
  screen: string;
  onPress: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  color,
  isLocked = false,
  screen,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: color },
        pressed && styles.pressed,
        isLocked && styles.lockedCard,
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
        {isLocked && (
          <View style={styles.lockContainer}>
            <Ionicons name="lock-closed" size={16} color="#666" />
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={isLocked ? '#999' : '#333'} 
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  lockedCard: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  icon: {
    fontSize: 30,
  },
  lockContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});