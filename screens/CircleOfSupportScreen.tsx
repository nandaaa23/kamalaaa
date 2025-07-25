import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { auth, db } from '../firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import io from 'socket.io-client';

const { width } = Dimensions.get('window');

interface UserProfile {
  journeyStage: string;
  currentFeelings: string[];
  interests: string[];
  language: string;
  displayName: string;
  role?: 'mother' | 'psychologist';
  specialization?: string;
  gender?: string;
  city?: string;
  registrationNumber?: string;
  registrationCouncil?: string;
  registrationYear?: string;
  degree?: string;
  college?: string;
  completionYear?: string;
  experience?: string;
  diploma?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  onboardingComplete: boolean;
  profile?: UserProfile;
  role: 'mother' | 'psychologist';
}

type TabType = 'mothers' | 'psychologists' | 'peer-group'; // Removed 'all' from the type

const CircleOfSupportScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('mothers'); // Default to 'mothers' instead of 'all'
  const [currentUserRole, setCurrentUserRole] = useState<'mother' | 'psychologist' | null>(null);
  const router = useRouter();
  const currentUser = auth.currentUser;
  const socket = io('http://172.20.10.3:3001');

  useEffect(() => {
    const fetchUsers = () => {
      const unsubscribeMothers = onSnapshot(collection(db, 'mothers'), (snapshot) => {
        const motherUsers: User[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        const currentUserData = motherUsers.find(u => u.id === currentUser?.uid);
        if (currentUserData) {
          setCurrentUserRole('mother');
        }

        setUsers((prev) => {
          const others = prev.filter((u) => u.role !== 'mother');
          return [...others, ...motherUsers];
        });
      });

      const unsubscribePsychologists = onSnapshot(collection(db, 'psychologists'), (snapshot) => {
        const psychologistUsers: User[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        const currentUserData = psychologistUsers.find(u => u.id === currentUser?.uid);
        if (currentUserData) {
          setCurrentUserRole('psychologist');
        }

        setUsers((prev) => {
          const others = prev.filter((u) => u.role !== 'psychologist');
          return [...others, ...psychologistUsers];
        });

        setLoading(false);
      });

      return () => {
        unsubscribeMothers();
        unsubscribePsychologists();
      };
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleUserPress = (user: User) => {
    router.push(`/talk/${user.id}`);
  };

  const handlePeerGroupPress = () => {
    router.push('/talk/peer-group');
  };

  const getFilteredUsers = () => {
    const filteredUsers = users.filter((u) => u.id !== currentUser?.uid);

    switch (activeTab) {
      case 'mothers':
        return filteredUsers.filter((u) => u.role === 'mother');
      case 'psychologists':
        return filteredUsers.filter((u) => u.role === 'psychologist');
      default:
        return filteredUsers;
    }
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleUserPress(item)}>
      <View style={styles.userHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {(item.profile?.displayName || item.name).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.profile?.displayName || item.name}
          </Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleEmoji}>
              {item.role === 'mother' ? '🌸' : '🎓'}
            </Text>
            <Text style={styles.roleText}>
              {item.role === 'mother' ? 'Mother' : 'Psychologist'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.connectButton}>
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userDetails}>
        {item.profile?.city && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{item.profile.city}</Text>
          </View>
        )}

        {item.profile?.specialization && item.role === 'psychologist' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🎯</Text>
            <Text style={styles.detailText}>Specializes in {item.profile.specialization}</Text>
          </View>
        )}

        {item.profile?.experience && item.role === 'psychologist' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>💼</Text>
            <Text style={styles.detailText}>{item.profile.experience} years experience</Text>
          </View>
        )}

        {item.profile?.journeyStage && item.role === 'mother' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🌱</Text>
            <Text style={styles.detailText}>Journey: {item.profile.journeyStage}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTabButton = (tabType: TabType, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabType && styles.activeTabButton]}
      onPress={() => setActiveTab(tabType)}
    >
      <Text style={[styles.tabButtonText, activeTab === tabType && styles.activeTabButtonText]}>
        {label}
      </Text>
      {activeTab === tabType && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );

  const renderPeerGroupCard = () => (
    <TouchableOpacity style={styles.peerGroupCard} onPress={handlePeerGroupPress}>
      <View style={styles.peerGroupHeader}>
        <View style={styles.peerGroupIconContainer}>
          <Text style={styles.peerGroupIcon}>👥</Text>
        </View>
        <View style={styles.peerGroupInfo}>
          <Text style={styles.peerGroupTitle}>Mother's Peer Support Group</Text>
          <Text style={styles.peerGroupSubtitle}>
            Connect with fellow mothers in a safe, supportive space
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.joinGroupButton}>
        <Text style={styles.joinGroupButtonText}>Join Group Chat</Text>
        <Text style={styles.joinGroupArrow}>→</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>
        {activeTab === 'mothers' ? '🌸' : activeTab === 'psychologists' ? '🎓' : '👥'}
      </Text>
      <Text style={styles.emptyStateTitle}>
        {activeTab === 'peer-group'
          ? 'Peer Group Available'
          : `No ${activeTab} available`}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {activeTab === 'peer-group'
          ? 'Join the peer group to connect with other mothers'
          : 'Check back later for new connections in your support circle'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your support circle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 Circle of Support</Text>
        <Text style={styles.headerSubtitle}>
          Connect with mothers and professionals in your journey
        </Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('mothers', 'Mothers')}
        {renderTabButton('psychologists', 'Psychologists')}
        {currentUserRole === 'mother' && renderTabButton('peer-group', 'Peer Group')}
      </View>

      <View style={styles.listContainer}>
        {activeTab === 'peer-group' ? (
          currentUserRole === 'mother' ? (
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              {renderPeerGroupCard()}
            </ScrollView>
          ) : (
            <View style={styles.accessDenied}>
              <Text style={styles.accessDeniedEmoji}>🚫</Text>
              <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
              <Text style={styles.accessDeniedText}>
                Peer groups are exclusively for mothers. Connect with individual mothers and psychologists instead.
              </Text>
            </View>
          )
        ) : filteredUsers.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderUserCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// ... (keep all your existing styles unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    // Active styling handled by indicator
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: Colors.mintCream,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  roleText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Peer Group Styles
  peerGroupCard: {
    backgroundColor: Colors.mintCream,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: `${Colors.primary}20`,
  },
  peerGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  peerGroupIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  peerGroupIcon: {
    fontSize: 28,
  },
  peerGroupInfo: {
    flex: 1,
  },
  peerGroupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  peerGroupSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  peerGroupDetails: {
    gap: 20,
  },
  peerGroupStats: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: `${Colors.textSecondary}30`,
    marginHorizontal: 16,
  },
  peerGroupFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  joinGroupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinGroupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  joinGroupArrow: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
export default CircleOfSupportScreen;