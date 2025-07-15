import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { BackButton } from '../components/BackButton';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  const profileSections = [
    {
      title: 'Account',
      items: [
        { label: 'Personal Information', icon: '👤', action: () => {} },
        { label: 'Language Settings', icon: '🌐', action: () => {} },
        { label: 'Notification Preferences', icon: '🔔', action: () => {} },
      ],
    },
    {
      title: 'Premium',
      items: [
        { label: 'Upgrade to Premium', icon: '✨', action: () => {}, isPremium: true },
        { label: 'Manage Subscription', icon: '💳', action: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', icon: '❓', action: () => {} },
        { label: 'Contact Support', icon: '📧', action: () => {} },
        { label: 'Privacy Policy', icon: '🔒', action: () => {} },
        { label: 'Terms of Service', icon: '📋', action: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {!user?.isGuest && (
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.profile?.displayName?.charAt(0) || 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.profile?.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {user?.isGuest && (
          <View style={styles.guestPrompt}>
            <Text style={styles.guestTitle}>Join Kamala</Text>
            <Text style={styles.guestDescription}>
              Create an account to access all features, sync your data, and connect with the community.
            </Text>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}

        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.listItem,
                  item.isPremium && styles.premiumItem,
                ]}
                onPress={item.action}
              >
                <View style={styles.listItemLeft}>
                  <Text style={styles.listItemIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.listItemText,
                    item.isPremium && styles.premiumText,
                  ]}>
                    {item.label}
                  </Text>
                </View>
                <Text style={styles.listItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {!user?.isGuest && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.jet,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  guestPrompt: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 8,
  },
  guestDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  premiumItem: {
    backgroundColor: Colors.pinkLavender2,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  listItemText: {
    fontSize: 16,
    color: Colors.jet,
  },
  premiumText: {
    fontWeight: '600',
  },
  listItemArrow: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  signOutButton: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});