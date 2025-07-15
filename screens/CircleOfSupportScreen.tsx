import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';

export const CircleOfSupportScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'groups'>('chat');
  const { user } = useAuth();

  const mockChats = [
    {
      id: '1',
      name: 'Sarah M.',
      lastMessage: 'Thank you for sharing your story...',
      time: '2m ago',
      isOnline: true,
    },
    {
      id: '2',
      name: 'Priya K.',
      lastMessage: 'I totally understand what you mean',
      time: '1h ago',
      isOnline: false,
    },
    {
      id: '3',
      name: 'Maya R.',
      lastMessage: 'Sending you hugs 💕',
      time: '3h ago',
      isOnline: true,
    },
  ];

  const mockGroups = [
    {
      id: '1',
      name: 'New Mothers Circle',
      description: 'For mothers in their first 6 months',
      members: 24,
      lastActivity: '5m ago',
    },
    {
      id: '2',
      name: 'Breastfeeding Support',
      description: 'Share experiences and tips',
      members: 18,
      lastActivity: '1h ago',
    },
    {
      id: '3',
      name: 'Work-Life Balance',
      description: 'Returning to work discussions',
      members: 15,
      lastActivity: '2h ago',
    },
  ];

  if (user?.isGuest) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.lockedScreen}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Join Kamala to Connect</Text>
          <Text style={styles.lockDescription}>
            Connect with other mothers, share experiences, and build meaningful relationships in a safe space.
          </Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Kamala</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>Circle of Support</Text>
        <Text style={styles.subtitle}>
          Connect with mothers who understand your journey
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Chats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            Groups
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'chat' ? (
          <View>
            {mockChats.map((chat) => (
              <TouchableOpacity key={chat.id} style={styles.chatItem}>
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>
                    {chat.name.charAt(0)}
                  </Text>
                  {chat.isOnline && <View style={styles.onlineIndicator} />}
                </View>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.chatMessage}>{chat.lastMessage}</Text>
                </View>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            {mockGroups.map((group) => (
              <TouchableOpacity key={group.id} style={styles.groupItem}>
                <View style={styles.groupIcon}>
                  <Text style={styles.groupIconText}>👥</Text>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupDescription}>{group.description}</Text>
                  <Text style={styles.groupMeta}>
                    {group.members} members • {group.lastActivity}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  lockedScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.jet,
    marginBottom: 12,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.jet,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  chatAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.mintGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupIconText: {
    fontSize: 20,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  groupMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 24,
    color: Colors.jet,
    fontWeight: '600',
  },
});